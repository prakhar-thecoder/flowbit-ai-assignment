"use client";
import useSWR from 'swr';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, FileText, Calendar, DollarSign, Building2, Trash2, Download, Settings } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
const fetcher = (url: string) => axios.get(url).then((r) => r.data);

export default function InvoicesPage() {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  // Debounce the search query by 1 second
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQ(q);
    }, 500);
    return () => clearTimeout(handle);
  }, [q]);

  const { data, mutate, isLoading } = useSWR(`${API_BASE}/invoices${debouncedQ ? `?q=${encodeURIComponent(debouncedQ)}` : ''}`, fetcher);

  async function deleteInvoice(id: string) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await axios.delete(`${API_BASE}/invoices/${id}`);
      mutate(); // Refresh the list
      toast.success('Invoice Deleted', {
        description: 'Invoice has been deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      toast.error('Delete Failed', {
        description: 'Failed to delete the invoice. Please try again.',
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Invoice Dashboard</h1>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Extract New</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>All Invoices</span>
            </CardTitle>
            <CardDescription>
              Search and manage your extracted invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vendor name or invoice number..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => mutate()} variant="outline" disabled={q !== debouncedQ}>
                {q !== debouncedQ ? 'Typing…' : 'Search'}
              </Button>
            </div>

            {/* Stats */}
            {data && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Total Invoices</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{data.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Total Value</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    ${data.reduce((sum: number, invoice: any) => sum + (invoice.invoice?.total || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Unique Vendors</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {new Set(data.map((invoice: any) => invoice.vendor?.name).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading invoices...</p>
              </div>
            ) : data && data.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-1/3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>Vendor</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>Invoice Number</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Date</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>Total</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[150px]">
                        <div className="flex items-center justify-center gap-2">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span>Actions</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row: any) => (
                      <TableRow key={row.id} className="hover:bg-muted/50">
                        <TableCell className="w-1/3">
                          <span className="font-medium">{row.vendor?.name || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <span>{row.invoice?.number || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <span>{row.invoice?.date || 'N/A'}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">
                            {row.invoice?.total ? `$${row.invoice.total.toLocaleString()}` : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/invoices/${row.id}`}>
                            <Button variant="outline" className="flex items-center space-x-1 gap-1">
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </Button>
                            </Link>
                            <a href={`${API_BASE}/files/${row.fileId}`} target="_blank" rel="noopener noreferrer">
                              <Button
                                variant="outline"
                                size="icon"
                                aria-label="Download PDF"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                            <Button
                              onClick={() => deleteInvoice(row.id)}
                              variant="destructive"
                              size="icon"
                              aria-label="Delete invoice"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No invoices found</p>
                <p className="text-sm">
                  {q ? 'Try adjusting your search terms.' : 'Upload and extract your first invoice to get started.'}
                </p>
                {!q && (
                  <Link href="/" className="mt-4 inline-block">
                    <Button className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Extract Invoice</span>
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}