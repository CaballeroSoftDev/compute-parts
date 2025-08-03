'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';
import { Trash2, Upload, Image as ImageIcon, Star, StarOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProductImage {
	id?: string;
	url: string;
	path: string;
	alt_text?: string;
	is_primary?: boolean;
	sort_order?: number;
	file?: File; // Archivo local para subida diferida
	isNew?: boolean; // Indica si es una imagen nueva
}

interface MultipleImageUploadProps {
	label?: string;
	images: ProductImage[];
	onImagesChange: (images: ProductImage[]) => void;
	productId?: string;
	maxImages?: number;
	showOptimization?: boolean;
	optimizeImage?: boolean;
	maxWidth?: number;
	maxHeight?: number;
	aspectRatio?: number;
	showPreview?: boolean;
	previewSize?: 'sm' | 'md' | 'lg';
	className?: string;
}

export function MultipleImageUpload({
	label = 'Imágenes',
	images = [],
	onImagesChange,
	productId,
	maxImages = 10,
	showOptimization = false,
	optimizeImage = false,
	maxWidth = 1920,
	maxHeight = 1080,
	aspectRatio,
	showPreview = true,
	previewSize = 'md',
	className
}: MultipleImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Función para optimizar imagen
	const optimizeImageFile = useCallback(async (file: File): Promise<File> => {
		if (!optimizeImage) return file;

		return new Promise((resolve) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const img = new Image();

			img.onload = () => {
				let { width, height } = img;

				// Calcular nuevas dimensiones manteniendo aspect ratio
				if (aspectRatio) {
					const currentRatio = width / height;
					if (currentRatio > aspectRatio) {
						height = width / aspectRatio;
					} else {
						width = height * aspectRatio;
					}
				}

				// Limitar dimensiones máximas
				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}
				if (height > maxHeight) {
					width = (width * maxHeight) / height;
					height = maxHeight;
				}

				canvas.width = width;
				canvas.height = height;

				ctx?.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						if (blob) {
							const optimizedFile = new File([blob], file.name, {
								type: 'image/jpeg',
								lastModified: Date.now()
							});
							resolve(optimizedFile);
						} else {
							resolve(file);
						}
					},
					'image/jpeg',
					0.8
				);
			};

			img.src = URL.createObjectURL(file);
		});
	}, [optimizeImage, aspectRatio, maxWidth, maxHeight]);

	// Función para validar archivos
	const validateFiles = (files: File[]): string[] => {
		const errors: string[] = [];
		const maxSize = 5 * 1024 * 1024; // 5MB
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

		files.forEach((file, index) => {
			if (!allowedTypes.includes(file.type)) {
				errors.push(`Archivo ${index + 1}: Tipo de archivo no soportado`);
			}
			if (file.size > maxSize) {
				errors.push(`Archivo ${index + 1}: Tamaño máximo 5MB`);
			}
		});

		if (images.length + files.length > maxImages) {
			errors.push(`Máximo ${maxImages} imágenes permitidas`);
		}

		return errors;
	};

	// Función para manejar selección de archivos (SIN subida inmediata)
	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		if (files.length === 0) return;

		// Validar archivos
		const validationErrors = validateFiles(files);
		if (validationErrors.length > 0) {
			setError(validationErrors.join(', '));
			return;
		}

		setError(null);
		setIsUploading(true);

		try {
			// Optimizar archivos si es necesario
			const optimizedFiles = await Promise.all(
				files.map(async (file) => await optimizeImageFile(file))
			);

			// Crear URLs temporales para preview
			const newImages: ProductImage[] = optimizedFiles.map((file, index) => ({
				id: `temp-${Date.now()}-${index}`,
				url: URL.createObjectURL(file),
				path: `temp/${file.name}`,
				alt_text: '',
				is_primary: images.length === 0 && index === 0, // Primera imagen como principal si no hay otras
				sort_order: images.length + index,
				file: file, // Guardar archivo para subida diferida
				isNew: true
			}));

			// Actualizar lista de imágenes
			const updatedImages = [...images, ...newImages];
			onImagesChange(updatedImages);

			setSuccess(`${files.length} imagen(es) agregada(s) correctamente`);
			setTimeout(() => setSuccess(null), 3000);

		} catch (error) {
			setError('Error al procesar las imágenes');
			console.error('Error processing images:', error);
		} finally {
			setIsUploading(false);
		}

		// Limpiar input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// Función para establecer imagen principal
	const setPrimaryImage = (imageId: string) => {
		const updatedImages = images.map(img => ({
			...img,
			is_primary: img.id === imageId
		}));
		onImagesChange(updatedImages);
	};

	// Función para eliminar imagen
	const removeImage = (imageId: string) => {
		const imageToRemove = images.find(img => img.id === imageId);
		if (imageToRemove) {
			// Liberar URL temporal si existe
			if (imageToRemove.isNew && imageToRemove.url.startsWith('blob:')) {
				URL.revokeObjectURL(imageToRemove.url);
			}
		}

		const updatedImages = images.filter(img => img.id !== imageId);
		onImagesChange(updatedImages);
	};

	// Función para actualizar alt text
	const updateAltText = (imageId: string, altText: string) => {
		const updatedImages = images.map(img =>
			img.id === imageId ? { ...img, alt_text: altText } : img
		);
		onImagesChange(updatedImages);
	};

	// Función para reordenar imágenes (mover hacia arriba)
	const moveImageUp = (index: number) => {
		if (index === 0) return;
		
		const updatedImages = [...images];
		const temp = updatedImages[index];
		updatedImages[index] = updatedImages[index - 1];
		updatedImages[index - 1] = temp;
		
		// Actualizar sort_order
		updatedImages.forEach((img, idx) => {
			img.sort_order = idx;
		});
		
		onImagesChange(updatedImages);
	};

	// Función para reordenar imágenes (mover hacia abajo)
	const moveImageDown = (index: number) => {
		if (index === images.length - 1) return;
		
		const updatedImages = [...images];
		const temp = updatedImages[index];
		updatedImages[index] = updatedImages[index + 1];
		updatedImages[index + 1] = temp;
		
		// Actualizar sort_order
		updatedImages.forEach((img, idx) => {
			img.sort_order = idx;
		});
		
		onImagesChange(updatedImages);
	};

	const getPreviewSize = () => {
		switch (previewSize) {
			case 'sm': return 'w-16 h-16';
			case 'lg': return 'w-32 h-32';
			default: return 'w-24 h-24';
		}
	};

	return (
		<div className={cn('space-y-4', className)}>
			{label && <Label className="text-base font-medium">{label}</Label>}

			{/* Input de archivos */}
			<div className="flex items-center gap-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading || images.length >= maxImages}
					className="flex items-center gap-2"
				>
					<Upload className="w-4 h-4" />
					Seleccionar imágenes
				</Button>

				{showOptimization && (
					<Badge variant="secondary">
						Optimización automática activada
					</Badge>
				)}

				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept="image/*"
					onChange={handleFileSelect}
					className="hidden"
					disabled={isUploading}
				/>
			</div>

			{/* Mensajes de estado */}
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert>
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			{/* Progreso de carga */}
			{isUploading && (
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span>Procesando imágenes...</span>
						<span>{uploadProgress}%</span>
					</div>
					<Progress value={uploadProgress} className="w-full" />
				</div>
			)}

			{/* Grid de imágenes */}
			{images.length > 0 && (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
					{images.map((image, index) => (
						<Card key={image.id} className="relative group overflow-hidden border-2">
							{/* Controles de navegación superiores */}
							<div className="flex items-center justify-between p-2 bg-gray-50 border-b">
								<Button
									size="sm"
									variant="ghost"
									onClick={() => moveImageUp(index)}
									disabled={index === 0}
									className="h-8 w-8 p-0 hover:bg-gray-200 disabled:opacity-30"
								>
									←
								</Button>
								
								<span className="text-sm font-medium text-gray-700 px-2">
									{index + 1}
								</span>
								
								<Button
									size="sm"
									variant="ghost"
									onClick={() => moveImageDown(index)}
									disabled={index === images.length - 1}
									className="h-8 w-8 p-0 hover:bg-gray-200 disabled:opacity-30"
								>
									→
								</Button>
							</div>

							{/* Container de imagen cuadrado */}
							<div className="relative aspect-square bg-white flex items-center justify-center p-4">
								<div className="relative w-full h-full flex items-center justify-center">
									<img
										src={image.url}
										alt={image.alt_text || 'Producto'}
										className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-sm"
									/>

									{/* Overlay con acciones */}
									<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
										<Button
											size="sm"
											variant="secondary"
											onClick={() => setPrimaryImage(image.id!)}
											className="h-8 w-8 p-0"
										>
											{image.is_primary ? (
												<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
											) : (
												<StarOff className="w-4 h-4" />
											)}
										</Button>

										<Button
											size="sm"
											variant="destructive"
											onClick={() => removeImage(image.id!)}
											className="h-8 w-8 p-0"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>

									{/* Badge de imagen principal */}
									{image.is_primary && (
										<Badge className="absolute -top-2 -left-2 bg-yellow-500 text-white">
											Principal
										</Badge>
									)}

									{/* Badge de imagen nueva */}
									{image.isNew && (
										<Badge className="absolute -top-2 -right-2 bg-blue-500 text-white">
											Nueva
										</Badge>
									)}
								</div>
							</div>

							{/* Input para alt text */}
							<div className="p-2">
								<Input
									placeholder="Texto alternativo"
									value={image.alt_text || ''}
									onChange={(e) => updateAltText(image.id!, e.target.value)}
									className="text-xs"
								/>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Información adicional */}
			{images.length === 0 && (
				<div className="text-center py-8 text-muted-foreground">
					<ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
					<p>No hay imágenes seleccionadas</p>
					<p className="text-sm">Máximo {maxImages} imágenes</p>
				</div>
			)}

			{/* Información de optimización */}
			{showOptimization && optimizeImage && (
				<div className="text-sm text-muted-foreground">
					<p>• Las imágenes se optimizarán automáticamente</p>
					<p>• Tamaño máximo: {maxWidth}x{maxHeight}px</p>
					{aspectRatio && (
						<p>• Relación de aspecto: {aspectRatio.toFixed(2)}:1</p>
					)}
				</div>
			)}
		</div>
	);
} 