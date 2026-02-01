'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setResult(null);
        } else {
            toast.error('Please select a valid CSV file');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setIsUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/admin/import-venues', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
                toast.success(`Successfully imported ${data.success} venues`);
            } else {
                toast.error(data.error || 'Import failed');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Import Venues</h1>
                <p className="text-muted-foreground">Bulk import venues from a CSV file</p>
            </div>

            {/* CSV Format Info */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        CSV Format
                    </CardTitle>
                    <CardDescription>
                        Your CSV file should have the following columns
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <pre>name,address,city,state,zip,phone,email,website,description,num_tables,table_types,amenities</pre>
                    </div>
                    <ul className="mt-4 text-sm text-muted-foreground space-y-1">
                        <li>• <code className="text-foreground">name</code> - Venue name (required)</li>
                        <li>• <code className="text-foreground">address</code> - Street address (required)</li>
                        <li>• <code className="text-foreground">city</code> - City (required)</li>
                        <li>• <code className="text-foreground">state</code> - 2-letter state code (required)</li>
                        <li>• <code className="text-foreground">zip</code> - ZIP code (required)</li>
                        <li>• <code className="text-foreground">phone</code> - Phone number (optional)</li>
                        <li>• <code className="text-foreground">email</code> - Email address (optional)</li>
                        <li>• <code className="text-foreground">website</code> - Website URL (optional)</li>
                        <li>• <code className="text-foreground">description</code> - Description (optional)</li>
                        <li>• <code className="text-foreground">num_tables</code> - Number of tables (optional)</li>
                        <li>• <code className="text-foreground">table_types</code> - Pipe-separated list, e.g. &quot;Pool|Snooker&quot; (optional)</li>
                        <li>• <code className="text-foreground">amenities</code> - Pipe-separated list, e.g. &quot;Bar|Food&quot; (optional)</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Upload CSV
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="csv-file">Select CSV File</Label>
                        <Input
                            id="csv-file"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="mt-1"
                        />
                    </div>

                    {file && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                    )}

                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {isUploading ? 'Importing...' : 'Import Venues'}
                    </Button>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <Card className={`border-2 ${result.errors.length === 0 ? 'border-green-500/50' : 'border-yellow-500/50'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {result.errors.length === 0 ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                            )}
                            Import Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold mb-2">
                            {result.success} venue{result.success !== 1 ? 's' : ''} imported successfully
                        </p>
                        {result.errors.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-destructive mb-2">
                                    {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}:
                                </p>
                                <ul className="text-sm text-muted-foreground space-y-1 max-h-40 overflow-auto">
                                    {result.errors.map((error, index) => (
                                        <li key={index}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
