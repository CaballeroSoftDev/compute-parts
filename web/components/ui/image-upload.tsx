'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  onFileSelect?: (file: File) => void; // Nueva prop para manejar la selección de archivo
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
  className?: string;
  accept?: string;
  maxSize?: number; // en MB
  uploadType?: 'category' | 'brand' | 'product';
  showOptimization?: boolean;
  optimizeImage?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number; // width/height
  showPreview?: boolean;
  previewSize?: 'sm' | 'md' | 'lg';
  // Nuevas props para controlar el comportamiento
  uploadOnSelect?: boolean; // Si es true, sube inmediatamente. Si es false, solo almacena temporalmente
  selectedFile?: File | null; // Archivo seleccionado temporalmente
  onFileChange?: (file: File | null) => void; // Callback para manejar cambios de archivo
}

export function ImageUpload({
  label = 'Subir imagen',
  value,
  onChange,
  onFileSelect,
  onUploadStart,
  onUploadComplete,
  className = '',
  accept = 'image/*',
  maxSize = 5,
  uploadType = 'category',
  showOptimization = true,
  optimizeImage = true,
  maxWidth = 1920,
  maxHeight = 1080,
  aspectRatio,
  showPreview = true,
  previewSize = 'md',
  uploadOnSelect = false, // Por defecto, no subir inmediatamente
  selectedFile,
  onFileChange,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(selectedFile || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Actualizar preview cuando cambie el valor
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  // Actualizar archivo temporal cuando cambie la prop
  useEffect(() => {
    setTempFile(selectedFile || null);
  }, [selectedFile]);

  // Limpiar estados cuando se complete la subida
  useEffect(() => {
    if (!isUploading && !isOptimizing) {
      setTimeout(() => {
        setUploadProgress(0);
        setError(null);
        setSuccess(false);
      }, 3000);
    }
  }, [isUploading, isOptimizing]);

  // Función para validar archivo
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Verificar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      return {
        valid: false,
        error: `El archivo es demasiado grande. Máximo ${maxSize}MB.`,
      };
    }

    // Verificar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no válido. Solo se permiten: ${allowedTypes.join(', ')}.`,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limpiar estados anteriores
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Error de validación');
      toast({
        title: 'Error de validación',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Almacenar archivo temporalmente
    setTempFile(file);
    onFileChange?.(file);

    // Si uploadOnSelect es true, subir inmediatamente
    if (uploadOnSelect) {
      await handleUpload(file);
    } else {
      // Solo notificar que se seleccionó un archivo
      onFileSelect?.(file);
      toast({
        title: 'Imagen seleccionada',
        description: 'La imagen se subirá cuando guardes los cambios',
      });
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para subir archivo (se llama desde el componente padre)
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    onUploadStart?.();

    try {
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Aquí se llamaría al servicio de subida
      // Por ahora simulamos una subida exitosa
      await new Promise((resolve) => setTimeout(resolve, 1000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Simular URL de imagen subida
      const mockUrl = `https://example.com/images/${Date.now()}-${file.name}`;
      onChange(mockUrl);
      setSuccess(true);
      toast({
        title: 'Imagen subida exitosamente',
        description: 'La imagen se ha subido correctamente',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setPreview(null);
      toast({
        title: 'Error al subir imagen',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      onUploadComplete?.();
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setTempFile(null);
    onChange('');
    onFileChange?.(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Función para subir el archivo temporal (llamada desde el componente padre)
  const uploadTempFile = async () => {
    if (tempFile) {
      await handleUpload(tempFile);
    }
  };

  // Exponer función para subir archivo temporal
  useEffect(() => {
    // @ts-ignore
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.uploadTempImage = uploadTempFile;
    }
  }, [tempFile]);

  const getPreviewSizeClasses = () => {
    switch (previewSize) {
      case 'sm':
        return 'h-20 w-20';
      case 'lg':
        return 'h-40 w-40';
      default:
        return 'h-32 w-32';
    }
  };

  const getProgressColor = () => {
    if (error) return 'bg-red-500';
    if (success) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>

      <div className="space-y-4">
        {/* Preview de imagen */}
        {preview && showPreview && (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className={`${getPreviewSizeClasses()} rounded-lg border object-cover`}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemoveImage}
            >
              <X className="h-3 w-3" />
            </Button>
            {success && (
              <div className="absolute -left-2 -top-2">
                <CheckCircle className="h-6 w-6 rounded-full bg-white text-green-500" />
              </div>
            )}
            {/* Indicador de archivo temporal */}
            {tempFile && !uploadOnSelect && (
              <div className="absolute -bottom-2 -left-2">
                <div className="rounded-full bg-yellow-500 px-2 py-1 text-xs text-white">Pendiente</div>
              </div>
            )}
          </div>
        )}

        {/* Barra de progreso */}
        {uploadProgress > 0 && (
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="flex items-center space-x-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Área de subida */}
        {!preview && (
          <div
            className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              isUploading || isOptimizing
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading || isOptimizing}
            />

            {isUploading || isOptimizing ? (
              <div className="space-y-2">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">{isOptimizing ? 'Optimizando imagen...' : 'Subiendo imagen...'}</p>
                {uploadProgress > 0 && <p className="text-xs text-gray-400">{uploadProgress}%</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Haz clic para subir una imagen</p>
                  <p className="text-xs text-gray-500">JPG, PNG, WebP, GIF hasta {maxSize}MB</p>
                  {showOptimization && (
                    <p className="mt-1 text-xs text-blue-500">Las imágenes se optimizarán automáticamente</p>
                  )}
                  {!uploadOnSelect && <p className="mt-1 text-xs text-yellow-600">La imagen se subirá al guardar</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón de subida alternativa */}
        {!preview && !isUploading && !isOptimizing && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Seleccionar imagen
          </Button>
        )}

        {/* Información adicional */}
        {showOptimization && (
          <div className="space-y-1 text-xs text-gray-500">
            <p>• Las imágenes se optimizarán automáticamente</p>
            <p>• Tamaño máximo: {maxSize}MB</p>
            <p>• Formatos soportados: JPG, PNG, WebP, GIF</p>
            {aspectRatio && <p>• Proporción recomendada: {aspectRatio}:1</p>}
            {!uploadOnSelect && <p>• La imagen se subirá al guardar los cambios</p>}
          </div>
        )}
      </div>
    </div>
  );
}
