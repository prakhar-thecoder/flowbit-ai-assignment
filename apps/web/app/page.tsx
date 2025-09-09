"use client";
import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// pdf.js worker is served from public copied in postinstall
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, Sparkles, Save, Trash2, Plus, Eye } from 'lucide-react';
import Link from 'next/link';

type LineItem = { description: string; unitPrice: number; quantity: number; total: number };
type InvoiceDoc = {
  id?: string;
  fileId: string;
  fileName: string;
  vendor: { name: string; address?: string; taxId?: string };
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: LineItem[];
  };
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<{ fileId: string; fileName: string } | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [doc, setDoc] = useState<InvoiceDoc | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(35); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }, []);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!pdfFile) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setPageNum(1); // Reset to first page
    };
    reader.readAsArrayBuffer(pdfFile);
  }, [pdfFile]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, pageNum, scale);
    }
  }, [pdfDoc, pageNum, scale]);

  // Resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !isLargeScreen) return;
      
      const container = document.querySelector('.resize-container') as HTMLElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain between 30% and 60%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 30), 60);
      setLeftPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, isLargeScreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pdfDoc) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          if (pageNum > 1) setPageNum(pageNum - 1);
          break;
        case 'ArrowRight':
          if (pageNum < numPages) setPageNum(pageNum + 1);
          break;
        case '+':
        case '=':
          e.preventDefault();
          setScale((s) => Math.min(5.0, s + 0.25));
          break;
        case '-':
          e.preventDefault();
          setScale((s) => Math.max(0.5, s - 0.25));
          break;
        case '0':
          e.preventDefault();
          setScale(1.0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdfDoc, pageNum, numPages]);

  async function renderPage(pdf: any, pageNumber: number, scaleValue: number) {
    if (!canvasRef.current) return;
    
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: scaleValue });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d')!;
      
      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Render the page
      const renderContext = { 
        canvasContext: context, 
        viewport: viewport 
      };
      
      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  }

  async function onUpload() {
    if (!pdfFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      const res = await axios.post(`${API_BASE}/upload`, formData);
      setFileMeta(res.data);
    } finally {
      setIsUploading(false);
    }
  }

  async function onExtract() {
    if (!fileMeta) return;
    setIsExtracting(true);
    try {
      const res = await axios.post(`${API_BASE}/extract`, { fileId: fileMeta.fileId, model: 'gemini' });
      const now = new Date().toISOString();
      const hydrated: InvoiceDoc = { ...res.data, fileId: fileMeta.fileId, fileName: fileMeta.fileName, createdAt: now };
      setDoc(hydrated);
    } finally {
      setIsExtracting(false);
    }
  }

  async function onSave() {
    if (!doc) return;
    setIsSaving(true);
    try {
      if (doc.id) {
        const res = await axios.put(`${API_BASE}/invoices/${doc.id}`, doc);
        setDoc(res.data);
      } else {
        const res = await axios.post(`${API_BASE}/invoices`, doc);
        setDoc(res.data);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function onDelete() {
    if (!doc?.id) return;
    await axios.delete(`${API_BASE}/invoices/${doc.id}`);
    setDoc(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Flowbit AI Invoice Extractor</h1>
            </div>
            <Link href="/invoices">
              <Button variant="outline" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>View Invoices</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="resize-container flex flex-col lg:flex-row gap-4 h-full">
          {/* PDF Viewer */}
          <Card className="h-fit w-full lg:w-auto" style={{ width: isLargeScreen ? `${leftPanelWidth}%` : '100%' }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>PDF Viewer</span>
              </CardTitle>
              <CardDescription>
                Upload and view your invoice PDF files. Use arrow keys to navigate, +/- to zoom, and 0 to reset zoom.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="pdf-upload">Select PDF File</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                    variant="outline"
                    size="sm"
                    disabled={!pdfFile || scale <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setScale(1.0)}
                      variant="outline"
                      size="sm"
                      disabled={!pdfFile}
                      className="text-xs"
                    >
                      Fit
                    </Button>
                    <span className="text-sm font-medium px-2 min-w-[60px] text-center">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>
                  <Button
                    onClick={() => setScale((s) => Math.min(5.0, s + 0.25))}
                    variant="outline"
                    size="sm"
                    disabled={!pdfFile || scale >= 5.0}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Page Navigation */}
                <div className="flex items-center space-x-2">
                  <Button
                    disabled={!pdfFile || pageNum <= 1}
                    onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
                    {pageNum} / {numPages}
                  </span>
                  <Button
                    disabled={!pdfFile || pageNum >= numPages}
                    onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!pdfFile || isUploading}
                  onClick={onUpload}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                </Button>
                <Button
                  disabled={!fileMeta || isExtracting}
                  onClick={onExtract}
                  variant="default"
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isExtracting ? 'Extracting...' : 'Extract with AI'}</span>
                </Button>
              </div>

              {/* PDF Canvas */}
              <div className="border rounded-lg overflow-auto bg-gray-50">
                <div className="flex justify-center p-4">
                  <canvas
                    ref={canvasRef}
                    className="shadow-lg"
                    style={{ height: 'auto' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resizer - Only show on large screens */}
          {isLargeScreen && (
            <div
              className={`w-1 transition-colors duration-200 flex-shrink-0 group ${
                isResizing 
                  ? 'bg-blue-500 cursor-col-resize' 
                  : 'bg-gray-300 hover:bg-blue-500 cursor-col-resize'
              }`}
              onMouseDown={() => setIsResizing(true)}
              title="Drag to resize panels"
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className={`w-0.5 h-8 rounded-full transition-colors duration-200 ${
                  isResizing 
                    ? 'bg-blue-600' 
                    : 'bg-gray-400 hover:bg-blue-600 group-hover:bg-blue-600'
                }`}></div>
              </div>
            </div>
          )}

          {/* Invoice Form */}
          <Card className="h-fit w-full lg:flex-1" style={{ width: isLargeScreen ? `${100 - leftPanelWidth}%` : '100%' }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Invoice Data</span>
              </CardTitle>
              <CardDescription>
                Review and edit extracted invoice information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {doc ? (
                <InvoiceForm doc={doc} setDoc={setDoc} onSave={onSave} onDelete={onDelete} isSaving={isSaving} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload a PDF and run AI extraction to populate fields.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InvoiceForm({ doc, setDoc, onSave, onDelete, isSaving }: { 
  doc: InvoiceDoc; 
  setDoc: (d: InvoiceDoc) => void; 
  onSave: () => Promise<void>; 
  onDelete: () => Promise<void>;
  isSaving: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Vendor Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Vendor Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">Vendor Name</Label>
            <Input
              id="vendor-name"
              placeholder="Enter vendor name"
              value={doc.vendor.name}
              onChange={(e) => setDoc({ ...doc, vendor: { ...doc.vendor, name: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-address">Address</Label>
            <Input
              id="vendor-address"
              placeholder="Enter vendor address"
              value={doc.vendor.address || ''}
              onChange={(e) => setDoc({ ...doc, vendor: { ...doc.vendor, address: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-tax-id">Tax ID</Label>
            <Input
              id="vendor-tax-id"
              placeholder="Enter tax ID"
              value={doc.vendor.taxId || ''}
              onChange={(e) => setDoc({ ...doc, vendor: { ...doc.vendor, taxId: e.target.value } })}
            />
          </div>
        </div>
      </div>

      {/* Invoice Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoice-number">Invoice Number</Label>
            <Input
              id="invoice-number"
              placeholder="Enter invoice number"
              value={doc.invoice.number}
              onChange={(e) => setDoc({ ...doc, invoice: { ...doc.invoice, number: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-date">Date</Label>
            <Input
              id="invoice-date"
              placeholder="Enter date"
              value={doc.invoice.date}
              onChange={(e) => setDoc({ ...doc, invoice: { ...doc.invoice, date: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-currency">Currency</Label>
            <Input
              id="invoice-currency"
              placeholder="Enter currency"
              value={doc.invoice.currency || ''}
              onChange={(e) => setDoc({ ...doc, invoice: { ...doc.invoice, currency: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-total">Total</Label>
            <Input
              id="invoice-total"
              type="number"
              placeholder="Enter total amount"
              value={doc.invoice.total || ''}
              onChange={(e) => setDoc({ ...doc, invoice: { ...doc.invoice, total: e.target.value ? Number(e.target.value) : undefined } })}
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
          <Button
            onClick={() => setDoc({ ...doc, invoice: { ...doc.invoice, lineItems: [...doc.invoice.lineItems, { description: '', unitPrice: 0, quantity: 0, total: 0 }] } })}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        <div className="space-y-3">
          {doc.invoice.lineItems.map((li, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-3 p-3 border rounded-lg bg-gray-50">
              <div className="flex-[4] space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  placeholder="Item description"
                  value={li.description}
                  onChange={(e) => updateLine(doc, setDoc, idx, { description: e.target.value })}
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Unit Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={li.unitPrice || ''}
                  onChange={(e) => updateLine(doc, setDoc, idx, { unitPrice: e.target.value ? Number(e.target.value) : 0 })}
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={li.quantity || ''}
                  onChange={(e) => updateLine(doc, setDoc, idx, { quantity: e.target.value ? Number(e.target.value) : 0 })}
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Total</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={li.total || ''}
                  onChange={(e) => updateLine(doc, setDoc, idx, { total: e.target.value ? Number(e.target.value) : 0 })}
                />
              </div>
              <div className="space-y-1 flex flex-col justify-center items-end gap-1">
                <Label className="text-xs">Actions</Label>
                <Button
                  onClick={() => deleteLineItem(doc, setDoc, idx)}
                  variant="destructive"
                  size="sm"
                  className="w-fit"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          {/* Add Item Button at the end */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => setDoc({ ...doc, invoice: { ...doc.invoice, lineItems: [...doc.invoice.lineItems, { description: '', unitPrice: 0, quantity: 0, total: 0 }] } })}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Item</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Invoice'}</span>
        </Button>
        <Button
          onClick={onDelete}
          disabled={!doc.id}
          variant="destructive"
          className="flex items-center space-x-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </Button>
      </div>
    </div>
  );
}

function updateLine(doc: InvoiceDoc, setDoc: (d: InvoiceDoc) => void, index: number, patch: Partial<LineItem>) {
  const copy = [...doc.invoice.lineItems];
  copy[index] = { ...copy[index], ...patch };
  setDoc({ ...doc, invoice: { ...doc.invoice, lineItems: copy } });
}

function deleteLineItem(doc: InvoiceDoc, setDoc: (d: InvoiceDoc) => void, index: number) {
  const copy = [...doc.invoice.lineItems];
  copy.splice(index, 1);
  setDoc({ ...doc, invoice: { ...doc.invoice, lineItems: copy } });
}