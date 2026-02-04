'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
    bucket?: string;
    folder?: string;
    onUpload: (url: string) => void;
    onRemove?: () => void;
    currentImage?: string;
    accept?: string;
    maxSizeMB?: number;
    className?: string;
}

export function ImageUpload({
    bucket = 'images',
    folder = 'uploads',
    onUpload,
    onRemove,
    currentImage,
    accept = 'image/*',
    maxSizeMB = 5,
    className = '',
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);

    const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`File too large. Maximum size is ${maxSizeMB}MB`);
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        setIsUploading(true);

        try {
            const supabase = createClient();

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            setPreview(publicUrl);
            onUpload(publicUrl);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, [bucket, folder, maxSizeMB, onUpload]);

    const handleRemove = useCallback(() => {
        setPreview(null);
        onRemove?.();
    }, [onRemove]);

    return (
        <div className={`space-y-3 ${className}`}>
            {preview ? (
                <div className="relative inline-block">
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemove}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ) : (
                <Label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                >
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">Upload</span>
                        </>
                    )}
                </Label>
            )}
            <Input
                id="image-upload"
                type="file"
                accept={accept}
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
            />
        </div>
    );
}

// Multi-image upload for galleries
interface MultiImageUploadProps {
    bucket?: string;
    folder?: string;
    onImagesChange: (urls: string[]) => void;
    currentImages?: string[];
    maxImages?: number;
    maxSizeMB?: number;
}

export function MultiImageUpload({
    bucket = 'images',
    folder = 'uploads',
    onImagesChange,
    currentImages = [],
    maxImages = 5,
    maxSizeMB = 5,
}: MultiImageUploadProps) {
    const [images, setImages] = useState<string[]>(currentImages);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (images.length + files.length > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`);
            return;
        }

        setIsUploading(true);

        try {
            const supabase = createClient();
            const uploadedUrls: string[] = [];

            for (const file of files) {
                if (file.size > maxSizeMB * 1024 * 1024) {
                    toast.error(`${file.name} is too large`);
                    continue;
                }

                const fileExt = file.name.split('.').pop();
                const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from(bucket)
                    .upload(fileName, file);

                if (error) {
                    console.error('Upload error:', error);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(data.path);

                uploadedUrls.push(publicUrl);
            }

            const newImages = [...images, ...uploadedUrls];
            setImages(newImages);
            onImagesChange(newImages);
            toast.success(`${uploadedUrls.length} image(s) uploaded`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload images');
        } finally {
            setIsUploading(false);
        }
    }, [bucket, folder, images, maxImages, maxSizeMB, onImagesChange]);

    const handleRemove = useCallback((index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages);
    }, [images, onImagesChange]);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
                {images.map((url, index) => (
                    <div key={url} className="relative">
                        <img
                            src={url}
                            alt={`Image ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-lg border"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5"
                            onClick={() => handleRemove(index)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <Label
                        htmlFor="multi-image-upload"
                        className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    >
                        {isUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground mt-1">Add</span>
                            </>
                        )}
                    </Label>
                )}
            </div>

            <Input
                id="multi-image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
            />

            <p className="text-xs text-muted-foreground">
                {images.length}/{maxImages} images • Max {maxSizeMB}MB each
            </p>
        </div>
    );
}
