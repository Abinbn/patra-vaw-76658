# Template Management - Quick Implementation Guide

## 📋 Step-by-Step Implementation

### Step 1: Database Setup (Supabase)
1. Open your Supabase project
2. Go to SQL Editor
3. Copy and paste the entire content from `database_schema_templates.sql`
4. Run the SQL script
5. Verify tables were created in the Table Editor

### Step 2: Admin Panel Enhancements

#### A. Add Image Preview Feature
**Location**: `src/pages/Admin.tsx` - Templates Section

Add state for preview:
```typescript
const [imagePreview, setImagePreview] = useState<string>('');
```

Add preview component after the image input:
```tsx
{(bgImageForm.imageUrl || imagePreview) && (
  <div className="mt-4">
    <Label>Preview</Label>
    <div className="border rounded-lg overflow-hidden">
      <img 
        src={bgImageForm.uploadMode === 'url' ? bgImageForm.imageUrl : imagePreview}
        alt="Preview"
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/800x500?text=Invalid+Image';
        }}
      />
    </div>
  </div>
)}
```

Update `handleImageFileChange` to generate preview:
```typescript
const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setBgImageForm({ ...bgImageForm, imageFile: file });
    
    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};
```

#### B. Add Edit Template Feature
**Location**: `src/pages/Admin.tsx` - Templates Section

Add state for editing:
```typescript
const [editingTemplate, setEditingTemplate] = useState<any>(null);
```

Add edit handler:
```typescript
const handleEditTemplate = (template: any) => {
  setEditingTemplate(template);
  setBgImageForm({
    name: template.name,
    description: template.description || '',
    imageUrl: template.image_url,
    tags: template.tags || [],
    uploadMode: 'url',
    imageFile: null,
  });
  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

Update `handleCreateBackgroundImage` to handle both create and update:
```typescript
const handleCreateBackgroundImage = async () => {
  // ... existing validation ...
  
  try {
    setUploadingImage(true);
    let finalImageUrl = bgImageForm.imageUrl;
    
    // ... existing upload logic ...
    
    if (editingTemplate) {
      // UPDATE existing template
      const { error } = await supabase
        .from('background_images')
        .update({
          name: bgImageForm.name,
          description: bgImageForm.description || null,
          image_url: finalImageUrl,
          tags: bgImageForm.tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTemplate.id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });
    } else {
      // INSERT new template (existing code)
      const { error } = await supabase
        .from('background_images')
        .insert({
          name: bgImageForm.name,
          description: bgImageForm.description || null,
          image_url: finalImageUrl,
          tags: bgImageForm.tags,
          created_by: user?.id,
        });
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Template added successfully',
      });
    }
    
    // Reset form
    setBgImageForm({
      name: '',
      description: '',
      imageUrl: '',
      tags: [],
      uploadMode: 'url',
      imageFile: null,
    });
    setEditingTemplate(null);
    setImagePreview('');
    
    loadBackgroundImages();
  } catch (error) {
    // ... error handling ...
  } finally {
    setUploadingImage(false);
  }
};
```

Update the button text:
```tsx
<Button onClick={handleCreateBackgroundImage} disabled={uploadingImage}>
  <Plus className="w-4 h-4 mr-2" />
  {uploadingImage 
    ? (editingTemplate ? 'Updating...' : 'Adding...') 
    : (editingTemplate ? 'Update Template' : 'Add Template')
  }
</Button>

{editingTemplate && (
  <Button 
    variant="outline" 
    onClick={() => {
      setEditingTemplate(null);
      setBgImageForm({
        name: '',
        description: '',
        imageUrl: '',
        tags: [],
        uploadMode: 'url',
        imageFile: null,
      });
      setImagePreview('');
    }}
  >
    Cancel Edit
  </Button>
)}
```

#### C. Add Delete Template Feature

Add delete handler:
```typescript
const handleDeleteTemplate = async (templateId: string, templateName: string) => {
  if (!confirm(`Are you sure you want to delete "${templateName}"? This action cannot be undone.`)) {
    return;
  }
  
  try {
    const { error } = await supabase
      .from('background_images')
      .delete()
      .eq('id', templateId);
      
    if (error) throw error;
    
    toast({
      title: 'Success',
      description: 'Template deleted successfully',
    });
    
    loadBackgroundImages();
  } catch (error) {
    console.error('Error deleting template:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete template',
      variant: 'destructive',
    });
  }
};
```

Add Edit and Delete buttons to each template card:
```tsx
{backgroundImages.map((image) => (
  <Card key={image.id} className="overflow-hidden">
    {/* ... existing image preview ... */}
    <CardHeader>
      <CardTitle className="text-sm">{image.name}</CardTitle>
      {/* ... existing description ... */}
    </CardHeader>
    <CardContent>
      {/* ... existing tags ... */}
      
      {/* NEW: Action buttons */}
      <div className="flex gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleEditTemplate(image)}
          className="flex-1"
        >
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => handleDeleteTemplate(image.id, image.name)}
          className="flex-1"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    </CardContent>
  </Card>
))}
```

### Step 3: User Template Page Enhancements

#### A. Connect to Database
**Location**: `src/pages/Templates.tsx`

Replace hardcoded array with database fetch:
```typescript
const [templates, setTemplates] = useState<BackgroundTemplate[]>([]);
const [filteredTemplates, setFilteredTemplates] = useState<BackgroundTemplate[]>([]);

useEffect(() => {
  fetchTemplates();
}, []);

const fetchTemplates = async () => {
  try {
    const { data, error } = await supabase
      .from('background_images')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    const formattedTemplates = data.map(t => ({
      id: t.id,
      name: t.name,
      imageUrl: t.image_url,
      tags: t.tags || [],
      category: t.category,
      description: t.description,
    }));
    
    setTemplates(formattedTemplates);
    setFilteredTemplates(formattedTemplates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    toast({
      title: 'Error',
      description: 'Failed to load templates',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};
```

Update search to use `templates` instead of `backgroundTemplates`:
```typescript
useEffect(() => {
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    const filtered = templates.filter(template =>
      template.name.toLowerCase().includes(query) ||
      template.tags.some(tag => tag.toLowerCase().includes(query)) ||
      template.category?.toLowerCase().includes(query)
    );
    setFilteredTemplates(filtered);
  } else {
    setFilteredTemplates(templates);
  }
}, [searchQuery, templates]);
```

#### B. Track Template Usage

Update `handleApplyTemplate` to track usage:
```typescript
const handleApplyTemplate = async (target: 'card' | 'profile' | 'both') => {
  if (!selectedTemplate || !cardData) return;
  
  setSaving(true);
  setApplyTarget(target);
  
  try {
    // ... existing apply logic ...
    
    // Track usage
    await supabase.rpc('increment_template_usage', {
      template_uuid: selectedTemplate.id
    });
    
    // Insert usage record
    await supabase
      .from('template_usage')
      .upsert({
        template_id: selectedTemplate.id,
        user_id: user?.id,
        applied_to: target,
      });
    
    // ... rest of existing code ...
  } catch (error) {
    // ... error handling ...
  } finally {
    setSaving(false);
    setApplyTarget(null);
  }
};
```

#### C. Add Category Filters

Add state:
```typescript
const [selectedCategory, setSelectedCategory] = useState<string>('all');
const [categories, setCategories] = useState<string[]>([]);

useEffect(() => {
  // Extract unique categories
  const uniqueCategories = [...new Set(templates.map(t => t.category).filter(Boolean))];
  setCategories(uniqueCategories as string[]);
}, [templates]);
```

Add filter UI before the template grid:
```tsx
<div className="flex flex-wrap gap-2 mb-6">
  <Button
    variant={selectedCategory === 'all' ? 'default' : 'outline'}
    size="sm"
    onClick={() => setSelectedCategory('all')}
  >
    All
  </Button>
  {categories.map(category => (
    <Button
      key={category}
      variant={selectedCategory === category ? 'default' : 'outline'}
      size="sm"
      onClick={() => setSelectedCategory(category)}
      className="capitalize"
    >
      {category}
    </Button>
  ))}
</div>
```

Update filtering logic:
```typescript
useEffect(() => {
  let filtered = templates;
  
  // Filter by category
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(t => t.category === selectedCategory);
  }
  
  // Filter by search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(template =>
      template.name.toLowerCase().includes(query) ||
      template.tags.some(tag => tag.toLowerCase().includes(query)) ||
      template.category?.toLowerCase().includes(query)
    );
  }
  
  setFilteredTemplates(filtered);
}, [searchQuery, selectedCategory, templates]);
```

### Step 4: Testing Checklist

- [ ] Database tables created successfully
- [ ] RLS policies working (test with admin and regular user)
- [ ] Admin can add new templates
- [ ] Image preview shows when entering URL
- [ ] Image preview shows when uploading file
- [ ] Admin can edit existing templates
- [ ] Admin can delete templates
- [ ] User template page loads templates from database
- [ ] Search works correctly
- [ ] Category filters work
- [ ] Template application works
- [ ] Usage tracking increments correctly

### Step 5: Optional Enhancements

1. **Add sorting options**:
   - Newest first
   - Most popular (by usage_count)
   - Alphabetical

2. **Add pagination or infinite scroll**:
   - Load 20 templates at a time
   - "Load More" button or auto-load on scroll

3. **Add template details modal**:
   - Full-screen preview
   - Show all metadata
   - Apply from modal

4. **Add "Recently Used" section**:
   - Query template_usage for current user
   - Show last 5 used templates

## 🎯 Key Files to Modify

1. `src/pages/Admin.tsx` - Admin template management
2. `src/pages/Templates.tsx` - User-facing template page
3. Run SQL in Supabase SQL Editor

## 📝 Important Notes

- Always test RLS policies with different user roles
- Validate image URLs before saving
- Handle loading and error states gracefully
- Add proper TypeScript types for template objects
- Consider image optimization (WebP, compression)
- Add analytics to track popular templates

## 🐛 Common Issues & Solutions

**Issue**: RLS policies blocking access
**Solution**: Check if user_roles table has admin role for your user

**Issue**: Images not loading
**Solution**: Check CORS settings and image URLs

**Issue**: Upload fails
**Solution**: Check Supabase storage bucket permissions

**Issue**: Search not working
**Solution**: Ensure tags are properly stored as array in database

## 📞 Need Help?

Refer to:
- `TEMPLATE_ENHANCEMENT_PLAN.md` for detailed feature descriptions
- `database_schema_templates.sql` for database structure
- Supabase docs for RLS and storage configuration
