"use client";
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Trash2, Plus, Building2, FileText, Calendar, DollarSign, Hash } from 'lucide-react';
import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
const fetcher = (url: string) => axios.get(url).then((r) => r.data);

export default function InvoiceDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, mutate, isLoading } = useSWR(`${API_BASE}/invoices/${params.id}`, fetcher);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function onSave() {
    if (!data) return;
    setIsSaving(true);
    try {
      const res = await axios.put(`${API_BASE}/invoices/${params.id}`, data);
      mutate(res.data);
    } finally {
      setIsSaving(false);
    }
  }

  async function onDelete() {
    if (!data) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE}/invoices/${params.id}`);
      router.push('/invoices');
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Invoice not found</p>
          <Link href="/invoices">
            <Button variant="outline">Back to Invoices</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/invoices">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Invoice Details</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </Button>
              <Button
                onClick={onDelete}
                disabled={isDeleting}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Vendor Information</span>
              </CardTitle>
              <CardDescription>
                Details about the invoice vendor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-name">Vendor Name</Label>
                <Input
                  id="vendor-name"
                  placeholder="Enter vendor name"
                  value={data.vendor?.name || ''}
                  onChange={(e) => mutate({ ...data, vendor: { ...data.vendor, name: e.target.value } }, false)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-address">Address</Label>
                <Input
                  id="vendor-address"
                  placeholder="Enter vendor address"
                  value={data.vendor?.address || ''}
                  onChange={(e) => mutate({ ...data, vendor: { ...data.vendor, address: e.target.value } }, false)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-tax-id">Tax ID</Label>
                <Input
                  id="vendor-tax-id"
                  placeholder="Enter tax ID"
                  value={data.vendor?.taxId || ''}
                  onChange={(e) => mutate({ ...data, vendor: { ...data.vendor, taxId: e.target.value } }, false)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Invoice Details</span>
              </CardTitle>
              <CardDescription>
                Basic invoice information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input
                    id="invoice-number"
                    placeholder="Enter invoice number"
                    value={data.invoice?.number || ''}
                    onChange={(e) => mutate({ ...data, invoice: { ...data.invoice, number: e.target.value } }, false)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-date">Date</Label>
                  <Input
                    id="invoice-date"
                    placeholder="Enter date"
                    value={data.invoice?.date || ''}
                    onChange={(e) => mutate({ ...data, invoice: { ...data.invoice, date: e.target.value } }, false)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-currency">Currency</Label>
                  <Input
                    id="invoice-currency"
                    placeholder="Enter currency"
                    value={data.invoice?.currency || ''}
                    onChange={(e) => mutate({ ...data, invoice: { ...data.invoice, currency: e.target.value } }, false)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-total">Total</Label>
                  <Input
                    id="invoice-total"
                    type="number"
                    placeholder="Enter total amount"
                    value={data.invoice?.total || ''}
                    onChange={(e) => mutate({ ...data, invoice: { ...data.invoice, total: e.target.value ? Number(e.target.value) : undefined } }, false)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="h-5 w-5" />
                  <span>Line Items</span>
                </CardTitle>
                <CardDescription>
                  Individual items and their details
                </CardDescription>
              </div>
              <Button
                onClick={() =>
                  mutate(
                    {
                      ...data,
                      invoice: {
                        ...data.invoice,
                        lineItems: [...(data.invoice?.lineItems || []), { description: '', unitPrice: 0, quantity: 0, total: 0 }]
                      }
                    },
                    false
                  )
                }
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.invoice?.lineItems || []).map((li: any, idx: number) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <Input
                      placeholder="Item description"
                      value={li.description}
                      onChange={(e) => updateLine(idx, { description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Unit Price</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={li.unitPrice ?? ''}
                      onChange={(e) => updateLine(idx, { unitPrice: numOrUndefined(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Quantity</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={li.quantity ?? ''}
                      onChange={(e) => updateLine(idx, { quantity: numOrUndefined(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Total</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={li.total ?? ''}
                      onChange={(e) => updateLine(idx, { total: numOrUndefined(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Actions</Label>
                    <Button
                      onClick={() => deleteLineItem(idx)}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {/* Add Item Button at the end */}
              <div className="flex justify-center pt-2">
                <Button
                  onClick={() =>
                    mutate(
                      {
                        ...data,
                        invoice: {
                          ...data.invoice,
                          lineItems: [...(data.invoice?.lineItems || []), { description: '', unitPrice: 0, quantity: 0, total: 0 }]
                        }
                      },
                      false
                    )
                  }
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Another Item</span>
                </Button>
              </div>
              {(!data.invoice?.lineItems || data.invoice.lineItems.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No line items added yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  function updateLine(index: number, patch: any) {
    const items = [...(data.invoice?.lineItems || [])];
    items[index] = { ...items[index], ...patch };
    mutate({ ...data, invoice: { ...data.invoice, lineItems: items } }, false);
  }

  function deleteLineItem(index: number) {
    const items = [...(data.invoice?.lineItems || [])];
    items.splice(index, 1);
    mutate({ ...data, invoice: { ...data.invoice, lineItems: items } }, false);
  }
}

function numOrUndefined(v: string) {
  return v === '' ? undefined : Number(v);
}