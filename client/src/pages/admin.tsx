import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Plus, ArrowLeft, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import type { Product, Category, ContactMessage, Accessory, Project, Brand, HeroImage, InsertProduct, InsertAccessory, InsertProject, InsertCategory, InsertBrand, InsertHeroImage } from "@shared/schema";
import type { SiteSettings, InsertSiteSettings } from "@shared/schema";
import { Settings } from "lucide-react";

// Helper function to create blob URLs for preview
const createBlobUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Helper function to revoke blob URLs to prevent memory leaks
const revokeBlobUrl = (url: string) => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

// Types for tracking files and previews
interface FileWithPreview {
  file: File;
  previewUrl: string;
  isVideo?: boolean;
}

export default function Admin() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditingAccessory, setIsEditingAccessory] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  
  // Search states for other sections
  const [accessorySearchTerm, setAccessorySearchTerm] = useState("");
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  
  // Hero image upload state
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'accessories' | 'contacts' | 'projects' | 'brands' | 'categories' | 'data-management' | 'hero-images' | 'settings'>('products');
  
  // Track files for upload (only upload on submit)
  const [productPrimaryImage, setProductPrimaryImage] = useState<FileWithPreview | null>(null);
  const [productAdditionalImages, setProductAdditionalImages] = useState<FileWithPreview[]>([]);
  const [accessoryPrimaryImage, setAccessoryPrimaryImage] = useState<FileWithPreview | null>(null);
  const [accessoryAdditionalImages, setAccessoryAdditionalImages] = useState<FileWithPreview[]>([]);
  const [projectPrimaryMedia, setProjectPrimaryMedia] = useState<FileWithPreview | null>(null);
  const [projectAdditionalMedia, setProjectAdditionalMedia] = useState<FileWithPreview[]>([]);
  const [categoryImage, setCategoryImage] = useState<FileWithPreview | null>(null);
  const [heroImagesToUpload, setHeroImagesToUpload] = useState<FileWithPreview[]>([]);

  const [formData, setFormData] = useState<Partial<InsertProduct>>({
    name: "",
    description: "",
    categorySlug: "",
    imageUrl: "",
    imageUrls: [],
    specificationList: [],
    accessories: [],
    inStock: true,
    featured: false,
  });
  
  const [accessoryFormData, setAccessoryFormData] = useState<Partial<InsertAccessory>>({
    name: "",
    modelNumber: "",
    description: "",
    imageUrl: "",
    imageUrls: [],
    brand: "",
    compatibleWith: [],
  });
  
  const [projectFormData, setProjectFormData] = useState<Partial<InsertProject>>({
    title: "",
    description: "",
    location: "",
    category: "",
    completedDate: "",
    primaryMediaUrl: "",
    additionalMediaUrls: [],
    imageUrls: [],
    productsUsed: [],
    featured: false,
  });

  // Brand management state
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandFormData, setBrandFormData] = useState<Partial<InsertBrand>>({
    name: "",
    description: "",
    website: "",
    isActive: true,
  });

  // Category management state
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<InsertCategory>>({
    name: "",
    slug: "",
    imageUrl: "",
    featured: false,
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<Partial<InsertSiteSettings>>({});

  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated, admin, isLoading } = useAdminAuth();

  // Data queries
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
    enabled: isAuthenticated,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: isAuthenticated,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: isAuthenticated,
  });

  const { data: contactMessages = [] } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages'],
    enabled: isAuthenticated,
  });

  const { data: accessories = [] } = useQuery<Accessory[]>({
    queryKey: ['/api/accessories'],
    enabled: isAuthenticated,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: isAuthenticated,
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
    enabled: isAuthenticated,
  });

  const { data: heroImages = [] } = useQuery<HeroImage[]>({
    queryKey: ['/api/hero-images'],
    enabled: isAuthenticated,
  });

  // Effect to clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up all blob URLs
      const allFiles = [
        productPrimaryImage,
        ...productAdditionalImages,
        accessoryPrimaryImage,
        ...accessoryAdditionalImages,
        projectPrimaryMedia,
        ...projectAdditionalMedia,
        categoryImage,
        ...heroImagesToUpload
      ].filter(Boolean) as FileWithPreview[];
      
      allFiles.forEach(item => {
        revokeBlobUrl(item.previewUrl);
      });
    };
  }, []);

  // Update settings form when siteSettings loads
  useEffect(() => {
    if (siteSettings) {
      setSettingsForm(siteSettings);
    }
  }, [siteSettings]);

  // Authentication effects
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Image upload mutation (used only on submit)
  const imageUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File is too large. Maximum size is 10MB.');
      }
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload image');
      }
      
      return response.json();
    },
    onError: (error: any) => {
      console.error('Image upload error:', error);
      const errorMessage = error.message || "Failed to upload image";
      toast({ 
        title: "Upload Failed", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
  });

  // Media upload mutation (for projects)
  const mediaUploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: 'primary' | 'additional' }) => {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      
      if (file.size > maxSize) {
        throw new Error(isVideo ? 'Video must be under 100MB' : 'Image must be under 10MB');
      }
      
      const formData = new FormData();
      formData.append('media', file);
      
      const endpoint = type === 'primary' ? '/api/upload/primary-media' : '/api/upload/additional-media';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload media');
      }
      
      return response.json();
    },
    onError: (error: any) => {
      toast({ 
        title: "Upload Failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const response = await apiRequest('POST', '/api/products', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Product created successfully" });
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to create product";
      toast({ 
        title: "Failed to create product", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProduct> }) => {
      const response = await apiRequest('PUT', `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Product updated successfully" });
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to update product";
      toast({ 
        title: "Update Failed", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  // Accessory mutations
  const createAccessoryMutation = useMutation({
    mutationFn: async (data: InsertAccessory) => {
      const response = await apiRequest('POST', '/api/accessories', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accessories'] });
      toast({ title: "Accessory created successfully" });
      resetAccessoryForm();
    },
    onError: (error: any) => {
      console.error('Accessory creation error:', error);
      const errorMessage = error?.message || "Failed to create accessory";
      toast({ 
        title: "Failed to create accessory", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
  });

  const updateAccessoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAccessory> }) => {
      const response = await apiRequest('PUT', `/api/accessories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accessories'] });
      toast({ title: "Accessory updated successfully" });
      resetAccessoryForm();
    },
    onError: (error: any) => {
      console.error('Accessory update error:', error);
      const errorMessage = error?.message || "Failed to update accessory";
      toast({ 
        title: "Failed to update accessory", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
  });

  const deleteAccessoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/accessories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accessories'] });
      toast({ title: "Accessory deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete accessory", variant: "destructive" });
    },
  });

  // Project mutations
  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest('POST', '/api/admin/projects', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({ title: "Project created successfully" });
      resetProjectForm();
    },
    onError: (error: any) => {
      console.error('Project creation error:', error);
      const errorMessage = error?.message || "Failed to create project";
      toast({ 
        title: "Failed to create project", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProject> }) => {
      const response = await apiRequest('PUT', `/api/admin/projects/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({ title: "Project updated successfully" });
      resetProjectForm();
    },
    onError: (error: any) => {
      console.error('Project update error:', error);
      const errorMessage = error?.message || "Failed to update project";
      toast({ 
        title: "Failed to update project", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({ title: "Project deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete project", variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/admin/logout');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/check'] });
      toast({ title: "Logged out successfully" });
      setLocation("/admin/login");
    },
    onError: () => {
      toast({ title: "Failed to logout", variant: "destructive" });
    },
  });

  // Data management mutations
  const clearDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/admin/clear-all-data');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accessories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Success",
        description: "All data cleared successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive"
      });
    }
  });

  const populateSampleDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/admin/populate-sample-data');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accessories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Success",
        description: "Sample data populated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to populate sample data",
        variant: "destructive"
      });
    }
  });

  // Brand mutations
  const createBrandMutation = useMutation({
    mutationFn: async (data: InsertBrand) => {
      return await apiRequest('POST', '/api/brands', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      resetBrandForm();
      toast({ title: "Brand created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create brand", variant: "destructive" });
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBrand> }) => {
      return await apiRequest('PUT', `/api/brands/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      resetBrandForm();
      toast({ title: "Brand updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update brand", variant: "destructive" });
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/brands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      toast({ title: "Brand deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete brand", variant: "destructive" });
    },
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      return await apiRequest('POST', '/api/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      resetCategoryForm();
      toast({ title: "Category created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create category", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCategory> }) => {
      return await apiRequest('PUT', `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      resetCategoryForm();
      toast({ title: "Category updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: "Category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete category", variant: "destructive" });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: InsertSiteSettings) => {
      const response = await apiRequest('POST', '/api/site-settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
      toast({ title: "Settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  // Hero Images mutations
  const createHeroImageMutation = useMutation({
    mutationFn: async (data: InsertHeroImage) => {
      const response = await apiRequest('POST', '/api/hero-images', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-images'] });
      toast({ title: "Hero image uploaded successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to upload hero image", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteHeroImageMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/hero-images/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-images'] });
      toast({ title: "Hero image deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete hero image", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Handle product form submit with image upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.imageUrl;
      let imageUrls = [...(formData.imageUrls || [])];
      
      // Upload primary image if new file selected
      if (productPrimaryImage) {
        toast({ title: "Uploading primary image..." });
        const result = await imageUploadMutation.mutateAsync(productPrimaryImage.file);
        imageUrl = result.imageUrl;
        revokeBlobUrl(productPrimaryImage.previewUrl);
        toast({ title: "Primary image uploaded" });
      }
      
      // Upload additional images if any
      if (productAdditionalImages.length > 0) {
        toast({ title: `Uploading ${productAdditionalImages.length} additional images...` });
        const uploadPromises = productAdditionalImages.map(async (item) => {
          const result = await imageUploadMutation.mutateAsync(item.file);
          revokeBlobUrl(item.previewUrl);
          return result.imageUrl;
        });
        
        const newUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newUrls];
        toast({ title: "Additional images uploaded" });
      }
      
      const data = {
        ...formData,
        imageUrl,
        imageUrls,
        specificationList: formData.specificationList || [],
      } as InsertProduct;

      if (isEditing && editingProduct) {
        if (!editingProduct.id) {
          toast({ 
            title: "Update Error", 
            description: "Product ID is missing",
            variant: "destructive" 
          });
          return;
        }
        await updateProductMutation.mutateAsync({ id: editingProduct.id, data });
      } else {
        await createProductMutation.mutateAsync(data);
      }
      
      // Clear file states after successful submission
      setProductPrimaryImage(null);
      setProductAdditionalImages([]);
      
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Submit failed",
        description: "Failed to upload images or save product",
        variant: "destructive"
      });
    }
  };

  // Handle accessory form submit
  const handleAccessorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = accessoryFormData.imageUrl;
      let imageUrls = [...(accessoryFormData.imageUrls || [])];
      
      // Upload primary image if new file selected
      if (accessoryPrimaryImage) {
        toast({ title: "Uploading accessory image..." });
        const result = await imageUploadMutation.mutateAsync(accessoryPrimaryImage.file);
        imageUrl = result.imageUrl;
        revokeBlobUrl(accessoryPrimaryImage.previewUrl);
      }
      
      // Upload additional images if any
      if (accessoryAdditionalImages.length > 0) {
        toast({ title: `Uploading ${accessoryAdditionalImages.length} additional images...` });
        const uploadPromises = accessoryAdditionalImages.map(async (item) => {
          const result = await imageUploadMutation.mutateAsync(item.file);
          revokeBlobUrl(item.previewUrl);
          return result.imageUrl;
        });
        
        const newUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newUrls];
      }
      
      const data = {
        ...accessoryFormData,
        imageUrl,
        imageUrls,
      } as InsertAccessory;

      if (isEditingAccessory && editingAccessory) {
        await updateAccessoryMutation.mutateAsync({ 
          id: editingAccessory.id, 
          data 
        });
      } else {
        await createAccessoryMutation.mutateAsync(data);
      }
      
      // Clear file states
      setAccessoryPrimaryImage(null);
      setAccessoryAdditionalImages([]);
      
    } catch (error) {
      console.error('Accessory submit error:', error);
      toast({
        title: "Submit failed",
        description: "Failed to upload images or save accessory",
        variant: "destructive"
      });
    }
  };

  // Handle project form submit
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let primaryMediaUrl = projectFormData.primaryMediaUrl;
      let additionalMediaUrls = [...(projectFormData.additionalMediaUrls || [])];
      
      // Upload primary media if new file selected
      if (projectPrimaryMedia) {
        toast({ title: "Uploading primary media..." });
        const result = await mediaUploadMutation.mutateAsync({
          file: projectPrimaryMedia.file,
          type: 'primary'
        });
        primaryMediaUrl = result.mediaUrl;
        revokeBlobUrl(projectPrimaryMedia.previewUrl);
      }
      
      // Upload additional media if any
      if (projectAdditionalMedia.length > 0) {
        toast({ title: `Uploading ${projectAdditionalMedia.length} additional media files...` });
        const uploadPromises = projectAdditionalMedia.map(async (item) => {
          const result = await mediaUploadMutation.mutateAsync({
            file: item.file,
            type: 'additional'
          });
          revokeBlobUrl(item.previewUrl);
          return result.mediaUrl;
        });
        
        const newUrls = await Promise.all(uploadPromises);
        additionalMediaUrls = [...additionalMediaUrls, ...newUrls];
      }
      
      const data = {
        ...projectFormData,
        primaryMediaUrl,
        additionalMediaUrls,
      } as InsertProject;

      if (isEditingProject && editingProject) {
        await updateProjectMutation.mutateAsync({ 
          id: editingProject.id, 
          data 
        });
      } else {
        await createProjectMutation.mutateAsync(data);
      }
      
      // Clear file states
      setProjectPrimaryMedia(null);
      setProjectAdditionalMedia([]);
      
    } catch (error) {
      console.error('Project submit error:', error);
      toast({
        title: "Submit failed",
        description: "Failed to upload media or save project",
        variant: "destructive"
      });
    }
  };

  // Handle brand form submit
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingBrand && editingBrand) {
      updateBrandMutation.mutate({ id: editingBrand.id, data: brandFormData as InsertBrand });
    } else {
      createBrandMutation.mutate(brandFormData as InsertBrand);
    }
  };

  // Handle category form submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = categoryFormData.imageUrl;
      
      // Upload category image if new file selected
      if (categoryImage) {
        toast({ title: "Uploading category image..." });
        const result = await imageUploadMutation.mutateAsync(categoryImage.file);
        imageUrl = result.imageUrl;
        revokeBlobUrl(categoryImage.previewUrl);
      }
      
      const data = {
        ...categoryFormData,
        imageUrl,
      } as InsertCategory;

      if (isEditingCategory && editingCategory) {
        await updateCategoryMutation.mutateAsync({ id: editingCategory.id, data });
      } else {
        await createCategoryMutation.mutateAsync(data);
      }
      
      // Clear file state
      setCategoryImage(null);
      
    } catch (error) {
      console.error('Category submit error:', error);
      toast({
        title: "Submit failed",
        description: "Failed to upload image or save category",
        variant: "destructive"
      });
    }
  };

  // File handlers (store locally for preview, upload on submit)
  const handleProductPrimaryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive"
        });
        return;
      }
      
      const previewUrl = createBlobUrl(file);
      setProductPrimaryImage({ file, previewUrl });
      
      // Clear existing image URL since we're uploading a new file
      setFormData(prev => ({ ...prev, imageUrl: "" }));
      
      toast({ 
        title: "Image selected", 
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB) - will upload on submit`
      });
    }
    e.target.value = '';
  };

  const handleProductAdditionalImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is over 10MB`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });
    
    const newFiles: FileWithPreview[] = validFiles.map(file => ({
      file,
      previewUrl: createBlobUrl(file),
    }));
    
    setProductAdditionalImages(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      toast({ 
        title: "Images selected", 
        description: `${newFiles.length} image(s) selected - will upload on submit`
      });
    }
    
    e.target.value = '';
  };

  const removeProductAdditionalImage = (indexToRemove: number) => {
    const item = productAdditionalImages[indexToRemove];
    if (item) {
      revokeBlobUrl(item.previewUrl);
    }
    setProductAdditionalImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAccessoryPrimaryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive"
        });
        return;
      }
      
      const previewUrl = createBlobUrl(file);
      setAccessoryPrimaryImage({ file, previewUrl });
      setAccessoryFormData(prev => ({ ...prev, imageUrl: "" }));
      
      toast({ 
        title: "Image selected", 
        description: `${file.name} - will upload on submit`
      });
    }
    e.target.value = '';
  };

  const handleAccessoryAdditionalImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is over 10MB`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });
    
    const newFiles: FileWithPreview[] = validFiles.map(file => ({
      file,
      previewUrl: createBlobUrl(file),
    }));
    
    setAccessoryAdditionalImages(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      toast({ 
        title: "Images selected", 
        description: `${newFiles.length} image(s) selected - will upload on submit`
      });
    }
    
    e.target.value = '';
  };

  const handleProjectPrimaryMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      
      if (file.size > maxSize) {
        const limitText = isVideo ? '100MB' : '10MB';
        toast({
          title: "File too large",
          description: `Please select a file under ${limitText}`,
          variant: "destructive"
        });
        return;
      }
      
      const previewUrl = createBlobUrl(file);
      setProjectPrimaryMedia({ file, previewUrl, isVideo });
      setProjectFormData(prev => ({ ...prev, primaryMediaUrl: "" }));
      
      toast({ 
        title: "Media selected", 
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB) - will upload on submit`
      });
    }
    e.target.value = '';
  };

  const handleProjectAdditionalMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      
      if (file.size > maxSize) {
        const limitText = isVideo ? '100MB' : '10MB';
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${limitText} limit`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });
    
    const newFiles: FileWithPreview[] = validFiles.map(file => ({
      file,
      previewUrl: createBlobUrl(file),
      isVideo: file.type.startsWith('video/'),
    }));
    
    setProjectAdditionalMedia(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      toast({ 
        title: "Media files selected", 
        description: `${newFiles.length} file(s) selected - will upload on submit`
      });
    }
    
    e.target.value = '';
  };

  const handleCategoryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive"
        });
        return;
      }
      
      const previewUrl = createBlobUrl(file);
      setCategoryImage({ file, previewUrl });
      setCategoryFormData(prev => ({ ...prev, imageUrl: "" }));
      
      toast({ 
        title: "Image selected", 
        description: `${file.name} - will upload on submit`
      });
    }
    e.target.value = '';
  };

  const handleHeroImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is over 10MB`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });
    
    const newFiles: FileWithPreview[] = validFiles.map(file => ({
      file,
      previewUrl: createBlobUrl(file),
    }));
    
    setHeroImagesToUpload(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      toast({ 
        title: "Hero images selected", 
        description: `${newFiles.length} image(s) selected`
      });
    }
    
    e.target.value = '';
  };

  // Remove functions
  const removeAdditionalImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, index) => index !== indexToRemove) || []
    }));
  };

  const removePrimaryMedia = () => {
    if (projectPrimaryMedia) {
      revokeBlobUrl(projectPrimaryMedia.previewUrl);
      setProjectPrimaryMedia(null);
    } else {
      setProjectFormData(prev => ({
        ...prev,
        primaryMediaUrl: ""
      }));
    }
  };

  const removeAdditionalMedia = (index: number) => {
    setProjectFormData(prev => ({
      ...prev,
      additionalMediaUrls: prev.additionalMediaUrls?.filter((_, i) => i !== index) || []
    }));
  };

  const removeProjectMedia = (index: number) => {
    setProjectFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, i) => i !== index) || []
    }));
  };

  // Reset functions
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      categorySlug: "",
      imageUrl: "",
      imageUrls: [],
      specificationList: [],
      accessories: [],
      inStock: true,
      featured: false,
    });
    // Clean up blob URLs
    if (productPrimaryImage) {
      revokeBlobUrl(productPrimaryImage.previewUrl);
    }
    productAdditionalImages.forEach(item => revokeBlobUrl(item.previewUrl));
    setProductPrimaryImage(null);
    setProductAdditionalImages([]);
    setIsEditing(false);
    setEditingProduct(null);
  };

  const resetAccessoryForm = () => {
    setAccessoryFormData({
      name: "",
      modelNumber: "",
      description: "",
      imageUrl: "",
      imageUrls: [],
      brand: "",
      compatibleWith: [],
    });
    // Clean up blob URLs
    if (accessoryPrimaryImage) {
      revokeBlobUrl(accessoryPrimaryImage.previewUrl);
    }
    accessoryAdditionalImages.forEach(item => revokeBlobUrl(item.previewUrl));
    setAccessoryPrimaryImage(null);
    setAccessoryAdditionalImages([]);
    setIsEditingAccessory(false);
    setEditingAccessory(null);
  };

  const resetProjectForm = () => {
    setProjectFormData({
      title: "",
      description: "",
      location: "",
      category: "",
      completedDate: "",
      primaryMediaUrl: "",
      additionalMediaUrls: [],
      imageUrls: [],
      productsUsed: [],
      featured: false,
    });
    // Clean up blob URLs
    if (projectPrimaryMedia) {
      revokeBlobUrl(projectPrimaryMedia.previewUrl);
    }
    projectAdditionalMedia.forEach(item => revokeBlobUrl(item.previewUrl));
    setProjectPrimaryMedia(null);
    setProjectAdditionalMedia([]);
    setIsEditingProject(false);
    setEditingProject(null);
  };

  const resetBrandForm = () => {
    setBrandFormData({
      name: "",
      description: "",
      website: "",
      isActive: true,
    });
    setIsEditingBrand(false);
    setEditingBrand(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      slug: "",
      imageUrl: "",
      featured: false,
    });
    // Clean up blob URL
    if (categoryImage) {
      revokeBlobUrl(categoryImage.previewUrl);
    }
    setCategoryImage(null);
    setIsEditingCategory(false);
    setEditingCategory(null);
  };

  // Edit handlers
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      categorySlug: product.categorySlug,
      brand: product.brand,
      imageUrl: product.imageUrl,
      imageUrls: product.imageUrls || [],
      specificationList: Array.isArray(product.specificationList) ? product.specificationList : [],
      accessories: product.accessories || [],
      inStock: product.inStock,
      featured: product.featured,
    });
    setIsEditing(true);
    setActiveTab('products');
  };

  const handleEditAccessory = (accessory: Accessory) => {
    setEditingAccessory(accessory);
    setAccessoryFormData({
      name: accessory.name,
      modelNumber: accessory.modelNumber || '',
      description: accessory.description,
      brand: accessory.brand || '',
      imageUrl: accessory.imageUrl,
      imageUrls: accessory.imageUrls || [],
      compatibleWith: accessory.compatibleWith || []
    });
    setIsEditingAccessory(true);
    setActiveTab('accessories');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormData({
      title: project.title,
      description: project.description,
      location: project.location,
      category: project.category,
      completedDate: project.completedDate,
      primaryMediaUrl: project.primaryMediaUrl || "",
      additionalMediaUrls: project.additionalMediaUrls || [],
      imageUrls: project.imageUrls || [],
      productsUsed: project.productsUsed || [],
      featured: project.featured,
    });
    setIsEditingProject(true);
    setActiveTab('projects');
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandFormData({
      name: brand.name,
      description: brand.description || "",
      website: brand.website || "",
      isActive: brand.isActive,
    });
    setIsEditingBrand(true);
    setActiveTab('brands');
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      featured: category.featured || false,
    });
    setIsEditingCategory(true);
    setActiveTab('categories');
  };

  // Delete handlers
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleDeleteAccessory = (id: string) => {
    if (confirm("Are you sure you want to delete this accessory?")) {
      deleteAccessoryMutation.mutate(id);
    }
  };

  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
    }
  };

  // Auto-generate slug from name
  const handleCategoryNameChange = (name: string) => {
    setCategoryFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }));
  };

  // Handle hero image upload on submit
  const handleHeroImageUpload = async () => {
    if (heroImagesToUpload.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select images to upload",
        variant: "destructive"
      });
      return;
    }

    setUploadingHeroImage(true);
    
    try {
      for (const item of heroImagesToUpload) {
        toast({ title: `Uploading ${item.file.name}...` });
        
        const result = await imageUploadMutation.mutateAsync(item.file);
        revokeBlobUrl(item.previewUrl);
        
        const heroImageData: InsertHeroImage = {
          title: `Hero Image ${new Date().toLocaleDateString()}`,
          imageUrl: result.imageUrl,
          description: "",
          isActive: true,
          order: heroImages.length,
        };
        
        await createHeroImageMutation.mutateAsync(heroImageData);
      }
      
      toast({ title: "All hero images uploaded successfully" });
      setHeroImagesToUpload([]);
      
    } catch (error) {
      console.error('Hero image upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload one or more images",
        variant: "destructive"
      });
    } finally {
      setUploadingHeroImage(false);
    }
  };

  // Remove hero image from upload queue
  const removeHeroImageFromQueue = (index: number) => {
    const item = heroImagesToUpload[index];
    if (item) {
      revokeBlobUrl(item.previewUrl);
    }
    setHeroImagesToUpload(prev => prev.filter((_, i) => i !== index));
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = !filterBrand || filterBrand === "all" || product.brand === filterBrand;
    const matchesCategory = !filterCategory || filterCategory === "all" || product.categorySlug === filterCategory;
    
    return matchesSearch && matchesBrand && matchesCategory;
  });

  // Get unique brands for filter dropdown
  const availableBrands = Array.from(new Set(products.filter(p => p.brand).map(p => p.brand))).sort();

  // Filter functions for other sections
  const filteredAccessories = accessories.filter(accessory =>
    !accessorySearchTerm || 
    accessory.name.toLowerCase().includes(accessorySearchTerm.toLowerCase()) ||
    accessory.description.toLowerCase().includes(accessorySearchTerm.toLowerCase()) ||
    (accessory.brand && accessory.brand.toLowerCase().includes(accessorySearchTerm.toLowerCase())) ||
    (accessory.modelNumber && accessory.modelNumber.toLowerCase().includes(accessorySearchTerm.toLowerCase()))
  );

  const filteredProjects = projects.filter(project =>
    !projectSearchTerm || 
    project.title.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(projectSearchTerm.toLowerCase())
  );

  const filteredBrands = brands.filter(brand =>
    !brandSearchTerm || 
    brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase()) ||
    (brand.description && brand.description.toLowerCase().includes(brandSearchTerm.toLowerCase()))
  );

  const filteredCategories = categories.filter(category =>
    !categorySearchTerm || 
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            <Link href="/">
              <Button variant="outline" size="sm" className="px-2 sm:px-3">
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Site</span>
              </Button>
            </Link>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              <span className="sm:hidden">Admin</span>
              <span className="hidden sm:inline">Admin Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden md:block">
              Welcome, {admin?.username}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="px-2 sm:px-3"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Global Settings
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'products' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('accessories')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'accessories' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Accessories ({accessories.length})
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'contacts' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Messages ({contactMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'projects' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'brands' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Brands ({brands.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'categories' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('data-management')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'data-management' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Data Management
          </button>
          <button
            onClick={() => setActiveTab('hero-images')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'hero-images' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Hero Images
          </button>
        </div>

        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Site Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateSettingsMutation.mutate(settingsForm as InsertSiteSettings);
                }} className="space-y-6">
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Phone Number</Label>
                        <Input 
                          value={settingsForm.phoneNumber || ''} 
                          onChange={e => setSettingsForm({...settingsForm, phoneNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <Input 
                          value={settingsForm.email || ''} 
                          onChange={e => setSettingsForm({...settingsForm, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Physical Address</Label>
                      <Input 
                        value={settingsForm.address || ''} 
                        onChange={e => setSettingsForm({...settingsForm, address: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Business Hours</Label>
                      <Input 
                        value={settingsForm.hours || ''} 
                        onChange={e => setSettingsForm({...settingsForm, hours: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Facebook URL</Label>
                        <Input 
                          value={settingsForm.facebookUrl || ''} 
                          onChange={e => setSettingsForm({...settingsForm, facebookUrl: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Twitter/X URL</Label>
                        <Input 
                          value={settingsForm.twitterUrl || ''} 
                          onChange={e => setSettingsForm({...settingsForm, twitterUrl: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>LinkedIn URL</Label>
                        <Input 
                          value={settingsForm.linkedinUrl || ''} 
                          onChange={e => setSettingsForm({...settingsForm, linkedinUrl: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Instagram URL</Label>
                        <Input 
                          value={settingsForm.instagramUrl || ''} 
                          onChange={e => setSettingsForm({...settingsForm, instagramUrl: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Footer</h3>
                    <div>
                      <Label>Footer Text</Label>
                      <Textarea 
                        value={settingsForm.footerText || ''} 
                        onChange={e => setSettingsForm({...settingsForm, footerText: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Tab Content */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Product Form */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                    <span className="text-lg sm:text-xl">{isEditing ? 'Edit Product' : 'Add Product'}</span>
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter product description for marketing and general information"
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="specificationList">Specification Table Items</Label>
                      <div className="space-y-2">
                        {(formData.specificationList || []).map((spec, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={spec}
                              onChange={(e) => {
                                const newSpecs = [...(formData.specificationList || [])];
                                newSpecs[index] = e.target.value;
                                setFormData({ ...formData, specificationList: newSpecs });
                              }}
                              placeholder="Enter specification item"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newSpecs = formData.specificationList?.filter((_, i) => i !== index) || [];
                                setFormData({ ...formData, specificationList: newSpecs });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFormData({ 
                              ...formData, 
                              specificationList: [...(formData.specificationList || []), ""]
                            });
                          }}
                        >
                          Add Specification Item
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Use format "Feature - Detail" for proper table display (e.g. "LED Technology - 50,000+ hour lifespan")</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.categorySlug}
                        onValueChange={(value) => setFormData({ ...formData, categorySlug: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.slug} value={category.slug}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Select
                        value={formData.brand || ""}
                        onValueChange={(value) => setFormData({ ...formData, brand: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.length === 0 ? (
                            <SelectItem value="no-brands" disabled>
                              No brands available - Add brands first
                            </SelectItem>
                          ) : (
                            brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.name}>
                                {brand.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Primary Image */}
                      <div>
                        <Label htmlFor="primaryImage">Primary Product Image *</Label>
                        <div className="space-y-2">
                          <Input
                            id="primaryImage"
                            type="file"
                            accept="image/*"
                            onChange={handleProductPrimaryImageSelect}
                          />
                          
                          {/* Show preview from local file or existing URL */}
                          {(productPrimaryImage || formData.imageUrl) && (
                            <div className="mt-2 relative">
                              <img 
                                src={productPrimaryImage?.previewUrl || formData.imageUrl} 
                                alt="Primary product preview" 
                                className="w-20 h-20 object-cover rounded border"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {productPrimaryImage 
                                  ? `Selected: ${productPrimaryImage.file.name} (${(productPrimaryImage.file.size / (1024 * 1024)).toFixed(2)}MB)`
                                  : "Existing image - upload new to replace"
                                }
                              </p>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-0 right-0 h-6 w-6 p-0"
                                onClick={() => {
                                  if (productPrimaryImage) {
                                    revokeBlobUrl(productPrimaryImage.previewUrl);
                                    setProductPrimaryImage(null);
                                  } else {
                                    setFormData(prev => ({ ...prev, imageUrl: "" }));
                                  }
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Images */}
                      <div>
                        <Label htmlFor="additionalImages">Additional Images</Label>
                        <div className="space-y-2">
                          <Input
                            id="additionalImages"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleProductAdditionalImagesSelect}
                          />
                          
                          {/* Show previews from local files or existing URLs */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {/* Existing image URLs */}
                            {formData.imageUrls?.map((url, index) => (
                              <div key={`existing-${index}`} className="relative">
                                <img 
                                  src={url} 
                                  alt={`Existing additional ${index + 1}`} 
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeAdditionalImage(index)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            
                            {/* New file previews */}
                            {productAdditionalImages.map((item, index) => (
                              <div key={`new-${index}`} className="relative">
                                <img 
                                  src={item.previewUrl} 
                                  alt={`New image ${index + 1}`} 
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <Button
                                  type="button"
                                  onClick={() => removeProductAdditionalImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 p-0 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            Files selected: {productAdditionalImages.length} new, {formData.imageUrls?.length || 0} existing
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="accessories">Compatible Accessories</Label>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value && !formData.accessories?.includes(value)) {
                            setFormData({ 
                              ...formData, 
                              accessories: [...(formData.accessories || []), value]
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select accessories to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {accessories
                            .filter(accessory => {
                              if (!formData.categorySlug || !accessory.compatibleWith) return false;
                              return accessory.compatibleWith.includes(formData.categorySlug) ||
                                     accessory.compatibleWith.includes('all') ||
                                     accessory.compatibleWith.some(cat => 
                                       formData.categorySlug?.includes(cat) || 
                                       cat.includes(formData.categorySlug?.split('-')[0] || '')
                                     );
                            })
                            .map((accessory) => (
                              <SelectItem key={accessory.id} value={accessory.id}>
                                {accessory.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {formData.accessories && formData.accessories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.accessories.map((accessoryId) => {
                            const accessory = accessories.find(a => a.id === accessoryId);
                            return accessory ? (
                              <span key={accessoryId} className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                                {accessory.name}
                                <button
                                  type="button"
                                  onClick={() => setFormData({ 
                                    ...formData, 
                                    accessories: formData.accessories?.filter(id => id !== accessoryId) || []
                                  })}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.inStock ?? true}
                          onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="inStock">In Stock</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.featured ?? false}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="featured">Featured Product</Label>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isEditing ? 'Update Product' : 'Add Product'}
                      {(productPrimaryImage || productAdditionalImages.length > 0) && 
                        ` (Upload ${[productPrimaryImage, ...productAdditionalImages].filter(Boolean).length} file(s))`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Products Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Products ({filteredProducts.length} of {products.length})</CardTitle>
                  
                  {/* Admin Filters */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-4">
                    <div className="flex-1 min-w-[200px]">
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    
                    <Select value={filterBrand} onValueChange={setFilterBrand}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {availableBrands.map((brand) => (
                          <SelectItem key={brand} value={brand || ''}>
                            {brand || 'No brand'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {(searchTerm || (filterBrand && filterBrand !== "all") || (filterCategory && filterCategory !== "all")) && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm("");
                          setFilterBrand("all");
                          setFilterCategory("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px]">Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Category</TableHead>
                          <TableHead className="hidden md:table-cell">Brand</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                          <TableHead className="hidden sm:table-cell text-center">Featured</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => {
                          const category = categories.find(c => c.slug === product.categorySlug);
                          return (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">
                                <div>
                                  <div className="font-medium text-sm">{product.name}</div>
                                  <div className="sm:hidden text-xs text-gray-500 mt-1">
                                    {category?.name || 'Unknown'}
                                    {product.featured && <span className="ml-1 text-yellow-600">★</span>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-sm">{category?.name || 'Unknown'}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                  {product.brand || 'No Brand'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  product.inStock 
                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                }`}>
                                  {product.inStock ? 'Available' : 'Unavailable'}
                                </span>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-center">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  product.featured 
                                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                }`}>
                                  {product.featured ? 'Featured' : 'Regular'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex space-x-1 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(product)}
                                    className="px-2"
                                  >
                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(product.id)}
                                    className="px-2 text-red-600 hover:text-red-700"
                                    disabled={deleteProductMutation.isPending}
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Accessories Tab Content */}
        {activeTab === 'accessories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isEditingAccessory ? 'Edit Accessory' : 'Add Accessory'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAccessorySubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="accessoryName">Name</Label>
                      <Input
                        id="accessoryName"
                        value={accessoryFormData.name}
                        onChange={(e) => setAccessoryFormData({ ...accessoryFormData, name: e.target.value })}
                        placeholder="Enter accessory name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="modelNumber">Model Number</Label>
                      <Input
                        id="modelNumber"
                        value={accessoryFormData.modelNumber || ""}
                        onChange={(e) => setAccessoryFormData({ ...accessoryFormData, modelNumber: e.target.value })}
                        placeholder="Enter model number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accessoryDescription">Description</Label>
                      <Textarea
                        id="accessoryDescription"
                        value={accessoryFormData.description}
                        onChange={(e) => setAccessoryFormData({ ...accessoryFormData, description: e.target.value })}
                        placeholder="Enter accessory description"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="accessoryBrand">Brand</Label>
                      <Select
                        value={accessoryFormData.brand || ""}
                        onValueChange={(value) => setAccessoryFormData({ ...accessoryFormData, brand: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.length === 0 ? (
                            <SelectItem value="no-brands" disabled>
                              No brands available - Add brands first
                            </SelectItem>
                          ) : (
                            brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.name}>
                                {brand.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Primary Image Upload */}
                    <div>
                      <Label>Primary Image</Label>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAccessoryPrimaryImageSelect}
                          className="flex-1"
                        />
                        
                        {(accessoryPrimaryImage || accessoryFormData.imageUrl) && (
                          <div className="flex items-center space-x-2">
                            <img 
                              src={accessoryPrimaryImage?.previewUrl || accessoryFormData.imageUrl} 
                              alt="Preview" 
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (accessoryPrimaryImage) {
                                  revokeBlobUrl(accessoryPrimaryImage.previewUrl);
                                  setAccessoryPrimaryImage(null);
                                } else {
                                  setAccessoryFormData({ ...accessoryFormData, imageUrl: "" });
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Images Upload */}
                    <div>
                      <Label>Additional Images</Label>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAccessoryAdditionalImagesSelect}
                          className="flex-1"
                        />
                        
                        {/* New file previews */}
                        {accessoryAdditionalImages.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {accessoryAdditionalImages.map((item, index) => (
                              <div key={index} className="relative">
                                <img 
                                  src={item.previewUrl} 
                                  alt={`Additional ${index + 1}`} 
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                                  onClick={() => {
                                    revokeBlobUrl(item.previewUrl);
                                    const newItems = [...accessoryAdditionalImages];
                                    newItems.splice(index, 1);
                                    setAccessoryAdditionalImages(newItems);
                                  }}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Existing images */}
                        {accessoryFormData.imageUrls?.map((url, index) => (
                          <div key={`existing-${index}`} className="relative inline-block mr-2 mb-2">
                            <img 
                              src={url} 
                              alt={`Existing ${index + 1}`} 
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                              onClick={() => {
                                const newUrls = [...(accessoryFormData.imageUrls || [])];
                                newUrls.splice(index, 1);
                                setAccessoryFormData({ ...accessoryFormData, imageUrls: newUrls });
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="compatibleWith">Compatible With (Categories)</Label>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (!(accessoryFormData.compatibleWith || []).includes(value)) {
                            setAccessoryFormData({ 
                              ...accessoryFormData, 
                              compatibleWith: [...(accessoryFormData.compatibleWith || []), value] 
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add compatible category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.slug}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(accessoryFormData.compatibleWith || []).map((categorySlug) => {
                          const category = categories.find(c => c.slug === categorySlug);
                          return (
                            <span key={categorySlug} className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                              {category?.name || categorySlug}
                              <button
                                type="button"
                                onClick={() => setAccessoryFormData({ 
                                  ...accessoryFormData, 
                                  compatibleWith: (accessoryFormData.compatibleWith || []).filter(slug => slug !== categorySlug) 
                                })}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        type="submit"
                        disabled={createAccessoryMutation.isPending || updateAccessoryMutation.isPending}
                        className="flex-1"
                      >
                        {createAccessoryMutation.isPending || updateAccessoryMutation.isPending 
                          ? 'Processing...' 
                          : isEditingAccessory ? 'Update Accessory' : 'Create Accessory'
                        }
                        {(accessoryPrimaryImage || accessoryAdditionalImages.length > 0) && 
                          ` (Upload ${[accessoryPrimaryImage, ...accessoryAdditionalImages].filter(Boolean).length} file(s))`}
                      </Button>
                      {isEditingAccessory && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetAccessoryForm}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Accessories ({filteredAccessories.length} of {accessories.length})</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search accessories..."
                        value={accessorySearchTerm}
                        onChange={(e) => setAccessorySearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    {accessorySearchTerm && (
                      <Button 
                        variant="outline" 
                        onClick={() => setAccessorySearchTerm("")}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Compatible With</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAccessories.map((accessory) => (
                          <TableRow key={accessory.id}>
                            <TableCell>{accessory.name}</TableCell>
                            <TableCell>{accessory.modelNumber || 'N/A'}</TableCell>
                            <TableCell>{accessory.brand || 'N/A'}</TableCell>
                            <TableCell>{accessory.compatibleWith?.join(', ') || 'None'}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditAccessory(accessory)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteAccessory(accessory.id)}
                                  disabled={deleteAccessoryMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Contact Messages Tab Content */}
        {activeTab === 'contacts' && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Contact Messages ({contactMessages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Contact</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead className="hidden md:table-cell">Phone</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{message.firstName} {message.lastName}</div>
                              <div className="sm:hidden text-xs text-gray-500 mt-1">
                                {message.email}
                                {message.phone && <> • {message.phone}</>}
                              </div>
                              <div className="sm:hidden text-xs text-gray-400 mt-1">
                                {new Date(message.submittedAt || '').toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{message.email}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{message.phone || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate text-sm">{message.message}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-gray-500">
                            {new Date(message.submittedAt || '').toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Tab Content */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Project Form */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                    <span className="text-lg sm:text-xl">{isEditingProject ? 'Edit Project' : 'Add Project'}</span>
                    {isEditingProject && (
                      <Button variant="outline" size="sm" onClick={resetProjectForm}>
                        Cancel
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProjectSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="projectTitle">Project Title</Label>
                      <Input
                        id="projectTitle"
                        value={projectFormData.title}
                        onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="projectDescription">Description</Label>
                      <Textarea
                        id="projectDescription"
                        value={projectFormData.description}
                        onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="projectLocation">Location</Label>
                      <Input
                        id="projectLocation"
                        value={projectFormData.location}
                        onChange={(e) => setProjectFormData({ ...projectFormData, location: e.target.value })}
                        placeholder="e.g., Downtown Office Complex"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={projectFormData.category} 
                        onValueChange={(value) => setProjectFormData({ ...projectFormData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Residential">Residential</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Educational">Educational</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="completedDate">Completed Date</Label>
                      <Input
                        id="completedDate"
                        type="date"
                        value={projectFormData.completedDate}
                        onChange={(e) => setProjectFormData({ ...projectFormData, completedDate: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label>Featured Project</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="projectFeatured"
                          checked={projectFormData.featured || false}
                          onChange={(e) => setProjectFormData({ ...projectFormData, featured: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="projectFeatured" className="text-sm">
                          Display in homepage carousel
                        </Label>
                      </div>
                    </div>

                    {/* Primary Media Upload */}
                    <div>
                      <Label>Primary Media (Main Image/Video)</Label>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                          <div className="text-center">
                            <input
                              type="file"
                              id="primaryMedia"
                              accept="image/*,video/*"
                              onChange={handleProjectPrimaryMediaSelect}
                              className="hidden"
                            />
                            <Label 
                              htmlFor="primaryMedia"
                              className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                            >
                              Select Primary Media
                            </Label>
                            <p className="text-sm text-muted-foreground mt-2">
                              Select main image (10MB max) or video (100MB max)
                            </p>
                          </div>
                        </div>

                        {/* Display preview */}
                        {(projectPrimaryMedia || projectFormData.primaryMediaUrl) && (
                          <div className="mt-4">
                            <div className="relative group inline-block">
                              {projectPrimaryMedia?.isVideo ? (
                                <video 
                                  src={projectPrimaryMedia.previewUrl}
                                  className="w-32 h-24 object-cover rounded border"
                                  controls={false}
                                />
                              ) : (
                                <img 
                                  src={projectPrimaryMedia?.previewUrl || projectFormData.primaryMediaUrl} 
                                  alt="Primary media preview"
                                  className="w-32 h-24 object-cover rounded border"
                                />
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={removePrimaryMedia}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Media Upload */}
                    <div>
                      <Label>Additional Media (Optional)</Label>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                          <div className="text-center">
                            <input
                              type="file"
                              id="additionalMedia"
                              multiple
                              accept="image/*,video/*"
                              onChange={handleProjectAdditionalMediaSelect}
                              className="hidden"
                            />
                            <Label 
                              htmlFor="additionalMedia"
                              className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-10 px-4 py-2"
                            >
                              Select Additional Media
                            </Label>
                            <p className="text-sm text-muted-foreground mt-2">
                              Select multiple images (10MB max each) or videos (100MB max each)
                            </p>
                          </div>
                        </div>

                        {/* Display previews */}
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          {/* Existing media */}
                          {projectFormData.additionalMediaUrls?.map((url, index) => (
                            <div key={`existing-${index}`} className="relative group">
                              {url.includes('.mp4') || url.includes('video') ? (
                                <video 
                                  src={url}
                                  className="w-full h-20 object-cover rounded border"
                                  controls={false}
                                />
                              ) : (
                                <img 
                                  src={url} 
                                  alt={`Existing media ${index + 1}`}
                                  className="w-full h-20 object-cover rounded border"
                                />
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeAdditionalMedia(index)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                          
                          {/* New media previews */}
                          {projectAdditionalMedia.map((item, index) => (
                            <div key={`new-${index}`} className="relative group">
                              {item.isVideo ? (
                                <video 
                                  src={item.previewUrl}
                                  className="w-full h-20 object-cover rounded border"
                                  controls={false}
                                />
                              ) : (
                                <img 
                                  src={item.previewUrl} 
                                  alt={`New media ${index + 1}`}
                                  className="w-full h-20 object-cover rounded border"
                                />
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  revokeBlobUrl(item.previewUrl);
                                  const newItems = [...projectAdditionalMedia];
                                  newItems.splice(index, 1);
                                  setProjectAdditionalMedia(newItems);
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Legacy Media Preview (for backward compatibility) */}
                    {projectFormData.imageUrls && projectFormData.imageUrls.length > 0 && (
                      <div>
                        <Label>Legacy Media (Backward Compatibility)</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          {projectFormData.imageUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              {url.includes('.mp4') || url.includes('video') ? (
                                <video 
                                  src={url}
                                  className="w-full h-24 object-cover rounded border"
                                  controls={false}
                                />
                              ) : (
                                <img 
                                  src={url} 
                                  alt={`Project media ${index + 1}`}
                                  className="w-full h-24 object-cover rounded border"
                                />
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeProjectMedia(index)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                    >
                      {createProjectMutation.isPending || updateProjectMutation.isPending ? (
                        isEditingProject ? 'Updating...' : 'Creating...'
                      ) : (
                        isEditingProject ? 'Update Project' : 'Create Project'
                      )}
                      {(projectPrimaryMedia || projectAdditionalMedia.length > 0) && 
                        ` (Upload ${[projectPrimaryMedia, ...projectAdditionalMedia].filter(Boolean).length} file(s))`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Projects List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Projects ({filteredProjects.length} of {projects.length})</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search projects..."
                        value={projectSearchTerm}
                        onChange={(e) => setProjectSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    {projectSearchTerm && (
                      <Button 
                        variant="outline" 
                        onClick={() => setProjectSearchTerm("")}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Title</TableHead>
                          <TableHead className="hidden sm:table-cell">Location</TableHead>
                          <TableHead className="hidden md:table-cell">Category</TableHead>
                          <TableHead className="hidden lg:table-cell">Completed</TableHead>
                          <TableHead className="text-center">Featured</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProjects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{project.title}</div>
                                <div className="md:hidden text-xs text-gray-500">
                                  {project.category} • {project.location}
                                </div>
                                <div className="lg:hidden text-xs text-gray-400">
                                  {new Date(project.completedDate).toLocaleDateString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm max-w-[150px] truncate">{project.location}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm">{project.category}</TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                              {new Date(project.completedDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                              {project.featured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                  Featured
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProject(project)}
                                  className="p-1 h-8 w-8"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="p-1 h-8 w-8 text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Data Management Tab Content */}
        {activeTab === 'data-management' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-amber-800 dark:text-amber-200 mb-2">
                      Clear All Data
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 mb-4">
                      This will permanently delete all products, accessories, and projects from the database. 
                      Categories and admin users will be preserved.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
                          clearDataMutation.mutate();
                        }
                      }}
                      disabled={clearDataMutation.isPending}
                    >
                      {clearDataMutation.isPending ? "Clearing..." : "Clear All Data"}
                    </Button>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                      Populate Sample Data
                    </h3>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      Add comprehensive sample data including 6 electrical products, 5 accessories, and 4 projects 
                      to get started quickly.
                    </p>
                    <Button
                      onClick={() => {
                        populateSampleDataMutation.mutate();
                      }}
                      disabled={populateSampleDataMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {populateSampleDataMutation.isPending ? "Adding Data..." : "Add Sample Data"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Products:</span>
                          <span className="font-medium">{products?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accessories:</span>
                          <span className="font-medium">{accessories?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Projects:</span>
                          <span className="font-medium">{projects?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Categories:</span>
                          <span className="font-medium">{categories?.length || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium">1. Clear existing data</p>
                          <p className="text-gray-600 dark:text-gray-400">Remove old test data to start fresh</p>
                        </div>
                        <div>
                          <p className="font-medium">2. Add products manually</p>
                          <p className="text-gray-600 dark:text-gray-400">Use Products tab with Cloudinary images</p>
                        </div>
                        <div>
                          <p className="font-medium">3. Add accessories</p>
                          <p className="text-gray-600 dark:text-gray-400">Use Accessories tab with category compatibility</p>
                        </div>
                        <div>
                          <p className="font-medium">4. Add projects</p>
                          <p className="text-gray-600 dark:text-gray-400">Use Projects tab with media uploads</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p>• Upload high-quality images (max 10MB)</p>
                        <p>• Use professional product photos</p>
                        <p>• Add detailed specifications</p>
                        <p>• Set compatible accessories</p>
                        <p>• Create similar product relationships</p>
                        <p>• Use Cloudinary for all media</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Getting Started
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">
                    Ready to populate your database with comprehensive electrical products and projects? 
                    Start by clearing the existing test data, then use the individual tabs to add:
                  </p>
                  <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                    <li>Professional electrical products with Cloudinary photos</li>
                    <li>Compatible accessories for each product category</li>
                    <li>Real project showcases with multiple media files</li>
                    <li>Detailed specifications and descriptions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Brands Management Tab */}
        {activeTab === 'brands' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{isEditingBrand ? 'Edit Brand' : 'Add Brand'}</span>
                    {isEditingBrand && (
                      <Button variant="outline" size="sm" onClick={resetBrandForm}>
                        Cancel
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBrandSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="brandName">Brand Name</Label>
                      <Input
                        id="brandName"
                        value={brandFormData.name || ''}
                        onChange={(e) => setBrandFormData({...brandFormData, name: e.target.value})}
                        required
                        placeholder="e.g., Schneider Electric"
                      />
                    </div>

                    <div>
                      <Label htmlFor="brandDescription">Description</Label>
                      <Textarea
                        id="brandDescription"
                        value={brandFormData.description || ''}
                        onChange={(e) => setBrandFormData({...brandFormData, description: e.target.value})}
                        placeholder="Brief description about the brand..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="brandWebsite">Website (Optional)</Label>
                      <Input
                        id="brandWebsite"
                        type="url"
                        value={brandFormData.website || ''}
                        onChange={(e) => setBrandFormData({...brandFormData, website: e.target.value})}
                        placeholder="https://www.example.com"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="brandActive"
                        checked={brandFormData.isActive ?? true}
                        onChange={(e) => setBrandFormData({...brandFormData, isActive: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="brandActive">Brand is Active</Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={createBrandMutation.isPending || updateBrandMutation.isPending}>
                      {isEditingBrand ? 'Update Brand' : 'Create Brand'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Management ({filteredBrands.length} of {brands.length})</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search brands..."
                        value={brandSearchTerm}
                        onChange={(e) => setBrandSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    {brandSearchTerm && (
                      <Button 
                        variant="outline" 
                        onClick={() => setBrandSearchTerm("")}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Brand Name</TableHead>
                          <TableHead className="hidden md:table-cell">Description</TableHead>
                          <TableHead className="hidden lg:table-cell">Website</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBrands.map((brand) => (
                          <TableRow key={brand.id}>
                            <TableCell className="font-medium">{brand.name}</TableCell>
                            <TableCell className="hidden md:table-cell max-w-xs truncate">
                              {brand.description || '-'}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {brand.website ? (
                                <a href={brand.website} target="_blank" rel="noopener noreferrer" 
                                   className="text-blue-600 hover:underline">
                                  Visit
                                </a>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                brand.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                              }`}>
                                {brand.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditBrand(brand)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteBrandMutation.mutate(brand.id)}
                                  disabled={deleteBrandMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {brands.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No brands found. Create your first brand above.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Categories Management Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{isEditingCategory ? 'Edit Category' : 'Add Category'}</span>
                    {isEditingCategory && (
                      <Button variant="outline" size="sm" onClick={resetCategoryForm}>
                        Cancel
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={categoryFormData.name || ''}
                        onChange={(e) => handleCategoryNameChange(e.target.value)}
                        required
                        placeholder="e.g., LED Fixtures"
                      />
                    </div>

                    <div>
                      <Label htmlFor="categorySlug">URL Slug (Auto-generated)</Label>
                      <Input
                        id="categorySlug"
                        value={categoryFormData.slug || ''}
                        onChange={(e) => setCategoryFormData({...categoryFormData, slug: e.target.value})}
                        required
                        placeholder="led-fixtures"
                        className="font-mono text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="categoryImage">Category Image</Label>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleCategoryImageSelect}
                          className="flex-1"
                        />
                        
                        {/* Display preview */}
                        {(categoryImage || categoryFormData.imageUrl) && (
                          <div className="mt-2">
                            <img 
                              src={categoryImage?.previewUrl || categoryFormData.imageUrl} 
                              alt="Category preview"
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                if (categoryImage) {
                                  revokeBlobUrl(categoryImage.previewUrl);
                                  setCategoryImage(null);
                                } else {
                                  setCategoryFormData({ ...categoryFormData, imageUrl: "" });
                                }
                              }}
                            >
                              Remove Image
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Featured Category Checkbox */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="categoryFeatured"
                        checked={categoryFormData.featured || false}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, featured: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <Label htmlFor="categoryFeatured">Featured Category (Show on Home Page)</Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                      {isEditingCategory ? 'Update Category' : 'Create Category'}
                      {categoryImage && ' (Upload 1 image)'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Category Management ({filteredCategories.length} of {categories.length})</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search categories..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    {categorySearchTerm && (
                      <Button 
                        variant="outline" 
                        onClick={() => setCategorySearchTerm("")}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Category Name</TableHead>
                          <TableHead className="hidden md:table-cell">Slug</TableHead>
                          <TableHead className="text-center">Featured</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="text-center w-16">
                              <img 
                                src={category.imageUrl} 
                                alt={category.name}
                                className="w-12 h-12 object-cover rounded mx-auto"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell className="hidden md:table-cell font-mono text-sm text-gray-600">
                              {category.slug}
                            </TableCell>
                            <TableCell className="text-center">
                              {category.featured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  Featured
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteCategoryMutation.mutate(category.id)}
                                  disabled={deleteCategoryMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {categories.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No categories found. Create your first category above.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Hero Images Tab Content */}
        {activeTab === 'hero-images' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Simple Upload Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Upload Hero Images</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Select images to upload. They will be uploaded when you click the Upload button.
                </p>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Select Hero Images
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Select high-quality images (JPG, PNG, WebP) up to 10MB each
                    </p>
                    
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleHeroImageSelect}
                      disabled={uploadingHeroImage}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:file:bg-gray-400"
                    />
                    
                    {uploadingHeroImage && (
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Uploading images...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Images Preview */}
                {heroImagesToUpload.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium">Selected Images ({heroImagesToUpload.length})</h4>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            heroImagesToUpload.forEach(item => revokeBlobUrl(item.previewUrl));
                            setHeroImagesToUpload([]);
                          }}
                        >
                          Clear All
                        </Button>
                        <Button
                          onClick={handleHeroImageUpload}
                          disabled={uploadingHeroImage}
                        >
                          {uploadingHeroImage ? 'Uploading...' : `Upload ${heroImagesToUpload.length} Image(s)`}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {heroImagesToUpload.map((item, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                          <div className="relative">
                            <img 
                              src={item.previewUrl} 
                              alt={`Hero image ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-6 w-6 p-0"
                              onClick={() => removeHeroImageFromQueue(index)}
                            >
                              ×
                            </Button>
                          </div>
                          <div className="p-2">
                            <p className="text-xs truncate">{item.file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Guidelines */}
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Quick Tips
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Recommended: 1920x1080 pixels or higher</li>
                    <li>• Maximum: 10MB per image</li>
                    <li>• Supports: JPG, PNG, WebP formats</li>
                    <li>• Select multiple images to upload them all at once</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Current Hero Images */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Current Hero Images ({heroImages.length})</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Your uploaded hero images. Click the delete button to remove any image.
                </p>
              </CardHeader>
              <CardContent>
                {heroImages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <p>No hero images uploaded yet.</p>
                    <p className="text-sm">Upload your first image above to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {heroImages.map((heroImage) => (
                      <div key={heroImage.id} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                        <div className="relative">
                          <img 
                            src={heroImage.imageUrl} 
                            alt="Hero image"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteHeroImageMutation.mutate(heroImage.id)}
                              disabled={deleteHeroImageMutation.isPending}
                              className="shadow-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Uploaded: {new Date(heroImage.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}