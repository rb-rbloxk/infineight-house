'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Upload, 
  Type, 
  Palette, 
  Move, 
  RotateCw, 
  Download, 
  Eye, 
  ShoppingCart,
  Heart,
  Share2,
  Ruler,
  Zap,
  CheckCircle,
  Layers,
  Sparkles,
  Grid3x3,
  AlignCenter,
  Trash2,
  Copy,
  Image as ImageIcon,
  Shapes,
  PaintBucket,
  Wand2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  opacity: number;
  layer: number;
  locked?: boolean;
  shadow?: boolean;
  stroke?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
}

interface ProductVariant {
  id: string;
  name: string;
  type: 'tshirt' | 'hoodie' | 'mug';
  color: string;
  colorName: string;
  size: string;
  price: number;
  available: boolean;
}

export default function CustomizePage() {
  return (
    <AuthGuard>
      <CustomizePageContent />
    </AuthGuard>
  );
}

function CustomizePageContent() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [selectedProduct, setSelectedProduct] = useState<ProductVariant>({
    id: '1',
    name: 'Premium Cotton T-Shirt',
    type: 'tshirt',
    color: '#FFFFFF',
    colorName: 'White',
    size: 'M',
    price: 599,
    available: true
  });

  const [designElements, setDesignElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewView, setPreviewView] = useState<'front' | 'back' | '3d'>('3d');
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [clientInstructions, setClientInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [rotation3D, setRotation3D] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);
  const dragRef = useRef<{ isDragging: boolean; elementId: string | null; offset: { x: number; y: number } }>({
    isDragging: false,
    elementId: null,
    offset: { x: 0, y: 0 }
  });
  const resizeRef = useRef<{ 
    isResizing: boolean; 
    elementId: string | null; 
    handle: string | null;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startElementX: number;
    startElementY: number;
  }>({
    isResizing: false,
    elementId: null,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startElementX: 0,
    startElementY: 0
  });

  const productColors = [
    { name: 'White', value: '#FFFFFF', price: 599 },
    { name: 'Black', value: '#000000', price: 599 },
    { name: 'Navy Blue', value: '#1E3A8A', price: 599 },
    { name: 'Forest Green', value: '#047857', price: 599 },
    { name: 'Burgundy', value: '#7F1D1D', price: 599 },
    { name: 'Royal Purple', value: '#6B21A8', price: 599 },
    { name: 'Charcoal', value: '#374151', price: 599 },
    { name: 'Heather Grey', value: '#9CA3AF', price: 599 },
  ];

  const productTypes = [
    { id: 'tshirt', name: 'T-Shirt', price: 599 },
    { id: 'hoodie', name: 'Hoodie', price: 899 },
    { id: 'polo', name: 'Polo Shirt', price: 699 },
    { id: 'tank', name: 'Tank Top', price: 499 },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const fonts = [
    'Arial', 
    'Helvetica', 
    'Times New Roman', 
    'Georgia', 
    'Courier New',
    'Comic Sans MS', 
    'Impact',
    'Verdana',
    'Trebuchet MS',
    'Arial Black',
    'Brush Script MT',
    'Lucida Handwriting'
  ];
  
  const fontWeights = ['normal', 'bold', '900'];

  const templates = [
    { id: 1, name: 'Brand Logo', elements: [] },
    { id: 2, name: 'Quote Design', elements: [] },
    { id: 3, name: 'Minimalist', elements: [] },
    { id: 4, name: 'Vintage', elements: [] },
  ];

  // Auto-rotate effect
  useEffect(() => {
    if (isAutoRotate && previewView === '3d') {
      const interval = setInterval(() => {
        setRotation3D((prev) => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAutoRotate, previewView]);

  const addTextElement = () => {
    const newElement: DesignElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Your Text Here',
      x: 200,
      y: 200,
      width: 250,
      height: 60,
      rotation: 0,
      fontSize: 36,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#000000',
      opacity: 1,
      layer: designElements.length,
      shadow: true,
      stroke: false,
      strokeColor: '#FFFFFF',
      strokeWidth: 2
    };
    setDesignElements([...designElements, newElement]);
    setSelectedElement(newElement.id);
    toast.success('Text element added');
  };

  const addImageElement = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image too large! Maximum size is 5MB');
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const newElement: DesignElement = {
            id: `image-${Date.now()}`,
            type: 'image',
            content: e.target?.result as string,
            x: 200,
            y: 200,
            width: 150,
            height: 150,
            rotation: 0,
            opacity: 1,
            layer: designElements.length,
            shadow: true
          };
          setDesignElements([...designElements, newElement]);
          setSelectedElement(newElement.id);
          toast.success('Image uploaded successfully');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addShapeElement = (shape: string) => {
    const newElement: DesignElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      content: shape, // 'circle', 'rectangle', 'triangle'
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      rotation: 0,
      color: '#3B82F6',
      opacity: 1,
      layer: designElements.length,
      shadow: true,
      stroke: true,
      strokeColor: '#1E40AF',
      strokeWidth: 3
    };
    setDesignElements([...designElements, newElement]);
    setSelectedElement(newElement.id);
    toast.success('Shape added');
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = designElements.find(el => el.id === elementId);
    if (!element || element.locked) return;
    
    setIsDragging(true);
    setSelectedElement(elementId);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const container = document.querySelector('[data-preview-container]')?.getBoundingClientRect();
    
    if (container) {
      const offsetX = e.clientX - container.left - element.x;
      const offsetY = e.clientY - container.top - element.y;
      
      setDragOffset({ x: offsetX, y: offsetY });
      dragRef.current = {
        isDragging: true,
        elementId,
        offset: { x: offsetX, y: offsetY }
      };
    }
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    // Handle dragging
    if (dragRef.current.isDragging && dragRef.current.elementId) {
      const container = document.querySelector('[data-preview-container]')?.getBoundingClientRect();
      if (!container) return;
      
      let newX = e.clientX - container.left - dragRef.current.offset.x;
      let newY = e.clientY - container.top - dragRef.current.offset.y;
      
      // Snap to grid if enabled
      if (snapToGrid) {
        const gridSize = 10;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      // Constrain to bounds
      const element = designElements.find(el => el.id === dragRef.current.elementId);
      if (element) {
        newX = Math.max(0, Math.min(newX, container.width - element.width));
        newY = Math.max(0, Math.min(newY, container.height - element.height));
      }
      
      updateElement(dragRef.current.elementId, { x: newX, y: newY });
      return;
    }
    
    // Handle resizing
    if (resizeRef.current.isResizing && resizeRef.current.elementId && resizeRef.current.handle) {
      const container = document.querySelector('[data-preview-container]')?.getBoundingClientRect();
      if (!container) return;
      
      const deltaX = (e.clientX - container.left - resizeRef.current.startX) / (zoom / 100);
      const deltaY = (e.clientY - container.top - resizeRef.current.startY) / (zoom / 100);
      
      let newWidth = resizeRef.current.startWidth;
      let newHeight = resizeRef.current.startHeight;
      let newX = resizeRef.current.startElementX;
      let newY = resizeRef.current.startElementY;
      
      const handle = resizeRef.current.handle;
      const minSize = 20; // Minimum size
      
      // Calculate new dimensions based on handle
      if (handle.includes('e')) { // East (right)
        newWidth = Math.max(minSize, resizeRef.current.startWidth + deltaX);
      }
      if (handle.includes('w')) { // West (left)
        newWidth = Math.max(minSize, resizeRef.current.startWidth - deltaX);
        newX = resizeRef.current.startElementX + (resizeRef.current.startWidth - newWidth);
      }
      if (handle.includes('s')) { // South (bottom)
        newHeight = Math.max(minSize, resizeRef.current.startHeight + deltaY);
      }
      if (handle.includes('n')) { // North (top)
        newHeight = Math.max(minSize, resizeRef.current.startHeight - deltaY);
        newY = resizeRef.current.startElementY + (resizeRef.current.startHeight - newHeight);
      }
      
      // Constrain to container bounds
      const maxWidth = container.width / (zoom / 100) - newX;
      const maxHeight = container.height / (zoom / 100) - newY;
      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);
      
      // Snap to grid if enabled
      if (snapToGrid) {
        const gridSize = 10;
        newWidth = Math.round(newWidth / gridSize) * gridSize;
        newHeight = Math.round(newHeight / gridSize) * gridSize;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      updateElement(resizeRef.current.elementId, { 
        width: Math.max(minSize, newWidth), 
        height: Math.max(minSize, newHeight),
        x: Math.max(0, newX),
        y: Math.max(0, newY)
      });
    }
  }, [snapToGrid, designElements, zoom]);

  const handleMouseUp = React.useCallback(() => {
    if (dragRef.current.isDragging) {
      setIsDragging(false);
      dragRef.current = {
        isDragging: false,
        elementId: null,
        offset: { x: 0, y: 0 }
      };
    }
    if (resizeRef.current.isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      resizeRef.current = {
        isResizing: false,
        elementId: null,
        handle: null,
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        startElementX: 0,
        startElementY: 0
      };
    }
  }, []);

  const handleResizeStart = (e: React.MouseEvent, elementId: string, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = designElements.find(el => el.id === elementId);
    if (!element || element.locked) return;
    
    setIsResizing(true);
    setResizeHandle(handle);
    setSelectedElement(elementId);
    
    const container = document.querySelector('[data-preview-container]')?.getBoundingClientRect();
    if (container) {
      resizeRef.current = {
        isResizing: true,
        elementId,
        handle,
        startX: e.clientX - container.left,
        startY: e.clientY - container.top,
        startWidth: element.width,
        startHeight: element.height,
        startElementX: element.x,
        startElementY: element.y
      };
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      if (isDragging) {
        document.body.style.cursor = 'grabbing';
      } else if (isResizing) {
        // Set cursor based on resize handle
        const cursorMap: { [key: string]: string } = {
          'nw': 'nw-resize',
          'ne': 'ne-resize',
          'sw': 'sw-resize',
          'se': 'se-resize',
          'n': 'n-resize',
          's': 's-resize',
          'e': 'e-resize',
          'w': 'w-resize'
        };
        document.body.style.cursor = cursorMap[resizeHandle || 'se'] || 'se-resize';
      }
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing, resizeHandle, handleMouseMove, handleMouseUp]);

  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setDesignElements(elements =>
      elements.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  };

  const deleteElement = (id: string) => {
    setDesignElements(elements => elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    toast.success('Element deleted');
  };

  const duplicateElement = (id: string) => {
    const element = designElements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `${element.type}-${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20,
        layer: designElements.length
      };
      setDesignElements([...designElements, newElement]);
      setSelectedElement(newElement.id);
      toast.success('Element duplicated');
    }
  };

  const centerElement = (id: string) => {
    const element = designElements.find(el => el.id === id);
    if (element) {
      updateElement(id, {
        x: 300 - element.width / 2,
        y: 300 - element.height / 2
      });
      toast.success('Element centered');
    }
  };

  const bringToFront = (id: string) => {
    const maxLayer = Math.max(...designElements.map(el => el.layer));
    updateElement(id, { layer: maxLayer + 1 });
  };

  const sendToBack = (id: string) => {
    updateElement(id, { layer: 0 });
    designElements.forEach(el => {
      if (el.id !== id && el.layer > 0) {
        updateElement(el.id, { layer: el.layer - 1 });
      }
    });
  };

  const captureCanvasAsImage = async (format: 'png' | 'pdf'): Promise<Blob | null> => {
    if (!previewContainerRef.current) return null;

    try {
      const container = previewContainerRef.current;
      
      // Store original styles to restore later
      const elementsToHide: Array<{ element: HTMLElement; originalDisplay: string; originalOpacity: string }> = [];
      
      // Hide resize handles and selection indicators temporarily
      const resizeHandles = container.querySelectorAll('[class*="cursor-nw-resize"], [class*="cursor-ne-resize"], [class*="cursor-sw-resize"], [class*="cursor-se-resize"], [class*="cursor-n-resize"], [class*="cursor-s-resize"], [class*="cursor-e-resize"], [class*="cursor-w-resize"]');
      const sizeDisplays = container.querySelectorAll('[class*="absolute"][class*="-top-8"]');
      
      // Hide UI elements
      resizeHandles.forEach((el) => {
        const htmlEl = el as HTMLElement;
        elementsToHide.push({
          element: htmlEl,
          originalDisplay: htmlEl.style.display,
          originalOpacity: htmlEl.style.opacity
        });
        htmlEl.style.display = 'none';
      });
      
      sizeDisplays.forEach((el) => {
        const htmlEl = el as HTMLElement;
        elementsToHide.push({
          element: htmlEl,
          originalDisplay: htmlEl.style.display,
          originalOpacity: htmlEl.style.opacity
        });
        htmlEl.style.display = 'none';
      });

      // Capture the canvas
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: container.offsetWidth,
        height: container.offsetHeight,
      });

      // Restore UI elements
      elementsToHide.forEach(({ element, originalDisplay, originalOpacity }) => {
        element.style.display = originalDisplay;
        element.style.opacity = originalOpacity;
      });

      if (format === 'png') {
        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png', 0.95);
        });
      } else {
        // Convert to PDF
        const imgData = canvas.toDataURL('image/png', 0.95);
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        const pdfBlob = pdf.output('blob');
        return pdfBlob;
      }
    } catch (error) {
      console.error('Error capturing canvas:', error);
      return null;
    }
  };

  const uploadDesignImage = async (blob: Blob, designId: string, format: 'png' | 'pdf'): Promise<string | null> => {
    try {
      const fileName = `${designId}-${Date.now()}.${format}`;
      const filePath = `designs/${user?.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('design-images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: format === 'png' ? 'image/png' : 'application/pdf'
        });

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('design-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadDesignImage:', error);
      return null;
    }
  };

  const addToCart = async () => {
    if (designElements.length === 0) {
      toast.error('Please add at least one design element');
      return;
    }

    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Save the design to the designs table first (to get the design ID)
      const designData = {
        elements: designElements,
        product: selectedProduct,
        canvasSettings: {
          grid: showGrid,
          snap: snapToGrid,
          zoom: zoom
        },
        timestamp: new Date().toISOString()
      };

      // Validate product_id - must be a valid UUID or null
      const isValidUUID = (str: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };
      
      const productId = selectedProduct.id && isValidUUID(selectedProduct.id) 
        ? selectedProduct.id 
        : null;

      const { data: design, error: designError } = await supabase
        .from('designs')
        .insert({
          user_id: user.id,
          product_id: productId,
          design_data: designData,
          preview_url: null,
          client_instructions: clientInstructions.trim() || null,
          is_saved: true
        })
        .select()
        .single();

      if (designError) {
        console.error('Error saving design:', designError);
        toast.error('Failed to save design: ' + designError.message);
        setIsSaving(false);
        return;
      }

      // 2. Capture and upload images
      toast.loading('Capturing design images...', { id: 'capturing' });

      const pngBlob = await captureCanvasAsImage('png');
      const pdfBlob = await captureCanvasAsImage('pdf');

      let pngUrl: string | null = null;
      let pdfUrl: string | null = null;

      if (pngBlob) {
        pngUrl = await uploadDesignImage(pngBlob, design.id, 'png');
      }

      if (pdfBlob) {
        pdfUrl = await uploadDesignImage(pdfBlob, design.id, 'pdf');
      }

      // 3. Update design with image URLs
      const { error: updateError } = await supabase
        .from('designs')
        .update({
          png_image_url: pngUrl,
          pdf_image_url: pdfUrl,
          preview_url: pngUrl // Use PNG as preview
        })
        .eq('id', design.id);

      if (updateError) {
        console.error('Error updating design with images:', updateError);
        // Don't fail the whole process if image upload fails
        toast.warning('Design saved but image upload failed', { id: 'capturing' });
      } else {
        toast.success('Design images captured successfully!', { id: 'capturing' });
      }

      // 4. Add to cart with design_id
      const customizationDetails = {
        designElements: designElements.length,
        customizationFee: 50,
        totalPrice: calculateTotal()
      };

      const { error: cartError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          design_id: design.id,
          quantity: quantity,
          size: selectedProduct.size,
          color: selectedProduct.color,
          customization_details: customizationDetails
        });

      if (cartError) {
        console.error('Error adding to cart:', cartError);
        toast.error('Failed to add to cart');
        setIsSaving(false);
        return;
      }

      toast.success('Added to cart!', {
        description: `${selectedProduct.name} (${selectedProduct.size}) x${quantity} with custom design`
      });

      // Reset form
      setClientInstructions('');
      setIsSaving(false);

      // Optionally redirect to cart
      // router.push('/cart');
    } catch (error) {
      console.error('Error in addToCart:', error);
      toast.error('Something went wrong');
      setIsSaving(false);
    }
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const calculateTotal = () => {
    const basePrice = selectedProduct.price;
    const customizationFee = designElements.length > 0 ? 50 : 0;
    return (basePrice + customizationFee) * quantity;
  };

  const downloadDesign = () => {
    toast.success('Design downloaded!', {
      description: 'Your custom design has been saved'
    });
  };

  const shareDesign = () => {
    toast.success('Share link copied to clipboard!');
  };

  const getSortedElements = () => {
    return [...designElements].sort((a, b) => a.layer - b.layer);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8" />
            Design Studio
          </h1>
          <p className="text-muted-foreground">Create your unique custom merchandise with our advanced design tools</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Design Tools */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Add Elements */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5" />
                  Add Elements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={addTextElement} variant="outline" className="w-full justify-start">
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
                <Button onClick={addImageElement} variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <Button onClick={() => addShapeElement('rectangle')} variant="outline" className="w-full justify-start">
                  <Shapes className="h-4 w-4 mr-2" />
                  Add Shape
                </Button>
              </CardContent>
            </Card>

            {/* Layers Panel */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2 text-lg">
                  <Layers className="h-5 w-5" />
                  Layers ({designElements.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {getSortedElements().reverse().map((element, index) => (
                  <div
                    key={element.id}
                    className={`p-2 rounded border cursor-pointer transition-all ${
                      selectedElement === element.id
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground flex items-center gap-2">
                        {element.type === 'text' && <Type className="h-3 w-3" />}
                        {element.type === 'image' && <ImageIcon className="h-3 w-3" />}
                        {element.type === 'shape' && <Shapes className="h-3 w-3" />}
                        <span className="truncate max-w-[100px]">
                          {element.content.substring(0, 15)}{element.content.length > 15 ? '...' : ''}
                        </span>
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateElement(element.id, { locked: !element.locked });
                          }}
                          title={element.locked ? 'Unlock' : 'Lock'}
                        >
                          {element.locked ? '🔒' : '🔓'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {designElements.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No elements yet. Add text, images, or shapes to get started!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* View Options */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5" />
                  View Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Grid</Label>
                  <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Snap to Grid</Label>
                  <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auto-Rotate 3D</Label>
                  <Switch checked={isAutoRotate} onCheckedChange={setIsAutoRotate} />
                </div>
                <div>
                  <Label className="text-sm">Zoom: {zoom}%</Label>
                  <Slider
                    value={[zoom]}
                    onValueChange={([value]) => setZoom(value)}
                    min={50}
                    max={150}
                    step={10}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Center - Preview Area */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Live 3D Preview
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Drag elements to position • {previewView === '3d' ? 'Rotate with controls' : 'Switch to 3D view'}
                    </p>
                  </div>
                  <Tabs value={previewView} onValueChange={(value) => setPreviewView(value as any)}>
                    <TabsList className="bg-secondary">
                      <TabsTrigger value="front">Front</TabsTrigger>
                      <TabsTrigger value="back">Back</TabsTrigger>
                      <TabsTrigger value="3d" className="flex items-center gap-1">
                        <RotateCw className="h-3 w-3" />
                        3D
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  ref={previewContainerRef}
                  className={`relative bg-gradient-to-br from-muted to-muted/50 rounded-xl p-8 min-h-[700px] flex items-center justify-center overflow-hidden ${
                    showGrid ? 'bg-grid-pattern' : ''
                  }`}
                  data-preview-container
                  style={{
                    backgroundImage: showGrid ? 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(100,100,100,0.1) 19px, rgba(100,100,100,0.1) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(100,100,100,0.1) 19px, rgba(100,100,100,0.1) 20px)' : 'none'
                  }}
                >
                  {/* 3D Mannequin/Product */}
                  <div 
                    className="relative transition-all duration-700 ease-in-out"
                    style={{
                      transform: `scale(${zoom / 100}) ${
                        previewView === '3d' 
                          ? `perspective(1200px) rotateY(${rotation3D}deg) rotateX(5deg)` 
                          : previewView === 'back'
                          ? 'perspective(1200px) rotateY(180deg)'
                          : 'perspective(1200px) rotateY(0deg)'
                      }`,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* T-Shirt 3D Model */}
                    <div className="relative w-[600px] h-[700px]">
                      {/* Mannequin Body */}
                      <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                        {/* Shoulders */}
                        <div 
                          className="w-96 h-32 rounded-t-full"
                          style={{
                            background: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)'
                          }}
                        />
                        
                        {/* Torso */}
                        <div 
                          className="w-80 h-96 mx-auto -mt-4"
                          style={{
                            background: 'linear-gradient(180deg, #D1D5DB 0%, #9CA3AF 100%)',
                            borderRadius: '0 0 50% 50%',
                            boxShadow: '0 6px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.2)'
                          }}
                        />
                      </div>

                      {/* T-Shirt Overlay */}
                      <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
                        {/* T-Shirt Body */}
                        <div 
                          className="w-96 h-[480px] rounded-2xl relative"
                          style={{
                            background: `linear-gradient(135deg, ${selectedProduct.color}F0 0%, ${selectedProduct.color}E0 50%, ${selectedProduct.color}D0 100%)`,
                            boxShadow: `0 10px 30px rgba(0,0,0,0.2), 
                                       inset 0 2px 4px rgba(255,255,255,0.3),
                                       inset 0 -2px 4px rgba(0,0,0,0.1)`,
                            border: `2px solid ${selectedProduct.color}CC`
                          }}
                        >
                          {/* Fabric Texture */}
                          <div 
                            className="absolute inset-0 opacity-10 rounded-2xl"
                            style={{
                              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, ${selectedProduct.color}80 2px, ${selectedProduct.color}80 4px)`
                            }}
                          />
                          
                          {/* Highlight Effect */}
                          <div 
                            className="absolute top-0 left-0 right-0 h-24 rounded-t-2xl"
                            style={{
                              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)'
                            }}
                          />
                        </div>
                        
                        {/* Left Sleeve */}
                        <div 
                          className="absolute top-4 -left-12 w-24 h-32 rounded-l-3xl"
                          style={{
                            background: `linear-gradient(90deg, ${selectedProduct.color}E0 0%, ${selectedProduct.color}D0 100%)`,
                            boxShadow: '-4px 4px 8px rgba(0,0,0,0.2)',
                            border: `2px solid ${selectedProduct.color}CC`
                          }}
                        />
                        
                        {/* Right Sleeve */}
                        <div 
                          className="absolute top-4 -right-12 w-24 h-32 rounded-r-3xl"
                          style={{
                            background: `linear-gradient(270deg, ${selectedProduct.color}E0 0%, ${selectedProduct.color}D0 100%)`,
                            boxShadow: '4px 4px 8px rgba(0,0,0,0.2)',
                            border: `2px solid ${selectedProduct.color}CC`
                          }}
                        />
                        
                        {/* Collar */}
                        <div 
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-40 h-12 rounded-t-full"
                          style={{
                            background: `linear-gradient(135deg, ${selectedProduct.color}E0 0%, ${selectedProduct.color}D0 100%)`,
                            border: `2px solid ${selectedProduct.color}CC`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        />
                        
                        {/* Collar Inner Circle */}
                        <div 
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-8 rounded-t-full bg-white/20"
                          style={{
                            border: `1px solid ${selectedProduct.color}AA`
                          }}
                        />
                      </div>

                      {/* Back Side Indicator */}
                      {previewView === 'back' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div 
                            className="text-6xl font-bold opacity-10 select-none"
                            style={{
                              transform: 'scaleX(-1)',
                              color: selectedProduct.color === '#FFFFFF' ? '#000000' : '#FFFFFF'
                            }}
                          >
                            BACK SIDE
                          </div>
                        </div>
                      )}

                      {/* Design Elements Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {getSortedElements().map((element) => (
                          <div
                            key={element.id}
                            className={`absolute transition-all duration-200 ${
                              (isDragging && dragRef.current.elementId === element.id) || (isResizing && resizeRef.current.elementId === element.id)
                                ? 'transition-none z-50' 
                                : 'duration-300 ease-out'
                            } ${
                              selectedElement === element.id ? 'outline-2 outline-dashed outline-primary/50' : ''
                            }`}
                            style={{
                              left: element.x,
                              top: element.y,
                              width: element.width,
                              height: element.height,
                              transform: `rotate(${element.rotation}deg)`,
                              opacity: element.opacity,
                              cursor: element.locked ? 'not-allowed' : (isDragging && dragRef.current.elementId === element.id ? 'grabbing' : 'grab'),
                              pointerEvents: element.locked ? 'none' : 'auto',
                              zIndex: element.layer,
                              filter: element.shadow ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' : 'none'
                            }}
                            onMouseDown={(e) => !isResizing && handleMouseDown(e, element.id)}
                            onClick={() => !isDragging && !isResizing && setSelectedElement(element.id)}
                          >
                            {element.type === 'text' ? (
                              <div
                                className="select-none"
                                style={{
                                  fontSize: element.fontSize,
                                  fontFamily: element.fontFamily,
                                  fontWeight: element.fontWeight,
                                  color: element.color,
                                  textShadow: element.shadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
                                  WebkitTextStroke: element.stroke ? `${element.strokeWidth}px ${element.strokeColor}` : 'none',
                                  whiteSpace: 'nowrap',
                                  pointerEvents: 'none'
                                }}
                              >
                                {element.content}
                              </div>
                            ) : element.type === 'image' ? (
                              <img
                                src={element.content}
                                alt="Design element"
                                className="w-full h-full object-contain select-none"
                                style={{ 
                                  pointerEvents: 'none',
                                  filter: element.shadow ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' : 'none'
                                }}
                                draggable={false}
                              />
                            ) : (
                              <div
                                className="w-full h-full"
                                style={{
                                  background: element.color,
                                  borderRadius: element.content === 'circle' ? '50%' : '8px',
                                  border: element.stroke ? `${element.strokeWidth}px solid ${element.strokeColor}` : 'none',
                                  pointerEvents: 'none'
                                }}
                              />
                            )}
                            
                            {/* Resize Handles - Only show when selected and not locked */}
                            {selectedElement === element.id && !element.locked && (
                              <>
                                {/* Corner handles */}
                                <div
                                  className="absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-nw-resize pointer-events-auto z-50"
                                  onMouseDown={(e) => handleResizeStart(e, element.id, 'nw')}
                                  style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                />
                                <div
                                  className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-ne-resize pointer-events-auto z-50"
                                  onMouseDown={(e) => handleResizeStart(e, element.id, 'ne')}
                                  style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                />
                                <div
                                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-sw-resize pointer-events-auto z-50"
                                  onMouseDown={(e) => handleResizeStart(e, element.id, 'sw')}
                                  style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                />
                                <div
                                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-se-resize pointer-events-auto z-50"
                                  onMouseDown={(e) => handleResizeStart(e, element.id, 'se')}
                                  style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                />
                                
                                {/* Edge handles */}
                                <div
                                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-n-resize pointer-events-auto z-50"
                                  onMouseDown={(e) => handleResizeStart(e, element.id, 'n')}
                                  style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                />
                                <div
                                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-s-resize pointer-events-auto z-50"
                                  onMouseDown={(e) => handleResizeStart(e, element.id, 's')}
                                  style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                />
                                <div
                                  className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-w-resize pointer-events-auto z-50"
                                  onMouseDown={(e) => handleResizeStart(e, element.id, 'w')}
                                  style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                />
                                <div
                                  className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-e-resize pointer-events-auto z-50"
                                  onMouseDown={(e) => handleResizeStart(e, element.id, 'e')}
                                  style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                />
                                
                                {/* Size Display */}
                                <div
                                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-50"
                                  style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                >
                                  {Math.round(element.width)} × {Math.round(element.height)} px
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* View Indicator */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-md">
                      {previewView === 'front' && '👕 Front View'}
                      {previewView === 'back' && '👕 Back View'}
                      {previewView === '3d' && '🔄 3D View'}
                    </Badge>
                  </div>

                  {/* 3D Controls */}
                  {previewView === '3d' && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-background/80 backdrop-blur-md p-2 rounded-lg border border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRotation3D((prev) => prev - 45)}
                        className="h-8"
                      >
                        ← Rotate Left
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRotation3D(0)}
                        className="h-8"
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRotation3D((prev) => prev + 45)}
                        className="h-8"
                      >
                        Rotate Right →
                      </Button>
                    </div>
                  )}

                  {/* Empty State */}
                  {designElements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center space-y-2 opacity-50">
                        <Wand2 className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground text-lg font-medium">Start Designing</p>
                        <p className="text-sm text-muted-foreground">Add text, images, or shapes to create your custom design</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={downloadDesign}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" onClick={shareDesign}>
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {designElements.length} Element{designElements.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Properties & Options */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Element Properties */}
            {selectedElement && (() => {
              const element = designElements.find(el => el.id === selectedElement);
              if (!element) return null;

              return (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-primary text-lg">Element Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {element.type === 'text' && (
                      <>
                        <div>
                          <Label className="text-sm">Text Content</Label>
                          <Input
                            value={element.content}
                            onChange={(e) => updateElement(element.id, { content: e.target.value })}
                            className="bg-background border-border mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Font Family</Label>
                          <Select
                            value={element.fontFamily}
                            onValueChange={(value) => updateElement(element.id, { fontFamily: value })}
                          >
                            <SelectTrigger className="bg-background border-border mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fonts.map(font => (
                                <SelectItem key={font} value={font}>{font}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Font Size: {element.fontSize}px</Label>
                          <Slider
                            value={[element.fontSize || 24]}
                            onValueChange={([value]) => updateElement(element.id, { fontSize: value })}
                            min={12}
                            max={96}
                            step={2}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Font Weight</Label>
                          <Select
                            value={element.fontWeight}
                            onValueChange={(value) => updateElement(element.id, { fontWeight: value })}
                          >
                            <SelectTrigger className="bg-background border-border mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                              <SelectItem value="900">Black</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Text Color</Label>
                          <Input
                            type="color"
                            value={element.color}
                            onChange={(e) => updateElement(element.id, { color: e.target.value })}
                            className="h-10 bg-background border-border mt-1"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Text Shadow</Label>
                          <Switch 
                            checked={element.shadow} 
                            onCheckedChange={(checked) => updateElement(element.id, { shadow: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Text Outline</Label>
                          <Switch 
                            checked={element.stroke} 
                            onCheckedChange={(checked) => updateElement(element.id, { stroke: checked })}
                          />
                        </div>
                        {element.stroke && (
                          <>
                            <div>
                              <Label className="text-sm">Outline Color</Label>
                              <Input
                                type="color"
                                value={element.strokeColor}
                                onChange={(e) => updateElement(element.id, { strokeColor: e.target.value })}
                                className="h-10 bg-background border-border mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Outline Width: {element.strokeWidth}px</Label>
                              <Slider
                                value={[element.strokeWidth || 2]}
                                onValueChange={([value]) => updateElement(element.id, { strokeWidth: value })}
                                min={1}
                                max={10}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {element.type === 'shape' && (
                      <>
                        <div>
                          <Label className="text-sm">Fill Color</Label>
                          <Input
                            type="color"
                            value={element.color}
                            onChange={(e) => updateElement(element.id, { color: e.target.value })}
                            className="h-10 bg-background border-border mt-1"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Border</Label>
                          <Switch 
                            checked={element.stroke} 
                            onCheckedChange={(checked) => updateElement(element.id, { stroke: checked })}
                          />
                        </div>
                        {element.stroke && (
                          <>
                            <div>
                              <Label className="text-sm">Border Color</Label>
                              <Input
                                type="color"
                                value={element.strokeColor}
                                onChange={(e) => updateElement(element.id, { strokeColor: e.target.value })}
                                className="h-10 bg-background border-border mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Border Width: {element.strokeWidth}px</Label>
                              <Slider
                                value={[element.strokeWidth || 3]}
                                onValueChange={([value]) => updateElement(element.id, { strokeWidth: value })}
                                min={1}
                                max={10}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {element.type === 'image' && (
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Drop Shadow</Label>
                        <Switch 
                          checked={element.shadow} 
                          onCheckedChange={(checked) => updateElement(element.id, { shadow: checked })}
                        />
                      </div>
                    )}

                    <Separator />

                    {/* Size Controls */}
                    <div>
                      <Label className="text-sm mb-2 block">Size (px)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Width</Label>
                          <Input
                            type="number"
                            value={Math.round(element.width)}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 20;
                              updateElement(element.id, { width: Math.max(20, value) });
                            }}
                            className="bg-background border-border mt-1"
                            min={20}
                            step={1}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Height</Label>
                          <Input
                            type="number"
                            value={Math.round(element.height)}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 20;
                              updateElement(element.id, { height: Math.max(20, value) });
                            }}
                            className="bg-background border-border mt-1"
                            min={20}
                            step={1}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Or drag the resize handles on the element
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm">Opacity: {Math.round(element.opacity * 100)}%</Label>
                      <Slider
                        value={[element.opacity]}
                        onValueChange={([value]) => updateElement(element.id, { opacity: value })}
                        min={0}
                        max={1}
                        step={0.05}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Rotation: {element.rotation}°</Label>
                      <Slider
                        value={[element.rotation]}
                        onValueChange={([value]) => updateElement(element.id, { rotation: value })}
                        min={-180}
                        max={180}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" onClick={() => duplicateElement(element.id)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicate
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => centerElement(element.id)}>
                        <AlignCenter className="h-3 w-3 mr-1" />
                        Center
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => bringToFront(element.id)}>
                        Bring Front
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => sendToBack(element.id)}>
                        Send Back
                      </Button>
                    </div>

                    <Button size="sm" variant="destructive" onClick={() => deleteElement(element.id)} className="w-full">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete Element
                    </Button>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Product Customization */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary text-lg">Product Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Product Type</Label>
                  <Select
                    value={selectedProduct.type}
                    onValueChange={(value) => {
                      const type = productTypes.find(t => t.id === value);
                      if (type) {
                        setSelectedProduct({
                          ...selectedProduct,
                          type: value as any,
                          name: type.name,
                          price: type.price
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-background border-border mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} - ₹{type.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {productColors.map((color) => (
                      <button
                        key={color.value}
                        className={`w-full h-10 rounded-lg border-2 transition-all ${
                          selectedProduct.color === color.value
                            ? 'border-primary ring-2 ring-primary/20 scale-110'
                            : 'border-border hover:border-primary/50'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedProduct({
                          ...selectedProduct,
                          color: color.value,
                          colorName: color.name
                        })}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Selected: {selectedProduct.colorName}</p>
                </div>

                <div>
                  <Label className="text-sm">Size</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {sizes.map((size) => (
                      <Button
                        key={size}
                        size="sm"
                        variant={selectedProduct.size === size ? 'default' : 'outline'}
                        onClick={() => setSelectedProduct({ ...selectedProduct, size })}
                        className="h-10"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Quantity</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10"
                    >
                      −
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="text-center h-10"
                      min="1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Price:</span>
                    <span className="text-foreground">₹{selectedProduct.price}</span>
                  </div>
                  {designElements.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Customization:</span>
                      <span className="text-foreground">₹50</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="text-foreground">×{quantity}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-primary">Total:</span>
                    <span className="text-primary">₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Separator />

                {/* Client Instructions */}
                <div>
                  <Label className="text-sm">Client Instructions (Optional)</Label>
                  <Textarea
                    value={clientInstructions}
                    onChange={(e) => setClientInstructions(e.target.value)}
                    placeholder="Add any special instructions or notes for this design..."
                    className="bg-background border-border mt-1 min-h-[100px]"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Provide any specific instructions or requirements for your design
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button 
                    onClick={addToCart} 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving Design...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button onClick={toggleWishlist} variant="outline" className="w-full" disabled={isSaving}>
                    <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                    {isInWishlist ? 'Remove from' : 'Add to'} Wishlist
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Size Guide */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2 text-lg">
                  <Ruler className="h-5 w-5" />
                  Size Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="font-medium">Size</span>
                    <span>Chest / Length</span>
                  </div>
                  {[
                    { size: 'S', chest: '36"', length: '27"' },
                    { size: 'M', chest: '40"', length: '28"' },
                    { size: 'L', chest: '44"', length: '29"' },
                    { size: 'XL', chest: '48"', length: '30"' },
                  ].map((item) => (
                    <div key={item.size} className="flex justify-between py-1 text-muted-foreground">
                      <span className="font-medium">{item.size}</span>
                      <span>{item.chest} / {item.length}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
