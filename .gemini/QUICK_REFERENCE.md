# Template Management - Quick Reference Card

## 🚀 Quick Start (5 Steps)

### 1️⃣ Database Setup
```bash
Location: Supabase SQL Editor
File: database_schema_templates.sql
Action: Copy → Paste → Run
Time: 2 minutes
```

### 2️⃣ Admin Panel - Add Preview
```typescript
// In Admin.tsx, add after image input:
{bgImageForm.imageUrl && (
  <div className="mt-4">
    <img src={bgImageForm.imageUrl} className="w-full h-48 object-cover rounded" />
  </div>
)}
```

### 3️⃣ Admin Panel - Add Edit/Delete
```typescript
// Add to each template card:
<Button onClick={() => handleEditTemplate(image)}>Edit</Button>
<Button onClick={() => handleDeleteTemplate(image.id)}>Delete</Button>
```

### 4️⃣ User Page - Connect Database
```typescript
// In Templates.tsx, replace hardcoded array:
const { data } = await supabase
  .from('background_images')
  .select('*')
  .eq('is_active', true);
```

### 5️⃣ User Page - Add Filters
```tsx
<Button onClick={() => setCategory('abstract')}>Abstract</Button>
<Button onClick={() => setCategory('nature')}>Nature</Button>
// Filter templates by category
```

---

## 📊 Database Quick Reference

### Main Table: `background_images`
```sql
Columns:
- id (UUID)
- name (TEXT) *required
- image_url (TEXT) *required
- tags (TEXT[])
- category (TEXT)
- is_active (BOOLEAN)
- usage_count (INTEGER)
- created_at, updated_at
```

### Key Functions
```sql
-- Increment usage
SELECT increment_template_usage('template-uuid-here');

-- Get popular templates
SELECT * FROM get_popular_templates(10);

-- Search templates
SELECT * FROM search_templates('blue');
```

---

## 🎯 Feature Checklist

### Admin Features
- [ ] ✅ Add template (existing)
- [ ] ⭐ Image preview (NEW)
- [ ] ⭐ Edit template (NEW)
- [ ] ⭐ Delete template (NEW)
- [ ] ⭐ View usage stats (NEW)

### User Features
- [ ] ✅ View templates (existing)
- [ ] ⭐ Database connection (NEW)
- [ ] ⭐ Category filters (NEW)
- [ ] ⭐ Enhanced search (NEW)
- [ ] ⭐ Usage tracking (NEW)

---

## 🔧 Code Snippets

### Admin: Image Preview
```typescript
const [imagePreview, setImagePreview] = useState('');

// In file input handler:
const reader = new FileReader();
reader.onloadend = () => setImagePreview(reader.result);
reader.readAsDataURL(file);
```

### Admin: Edit Template
```typescript
const handleEditTemplate = (template) => {
  setEditingTemplate(template);
  setBgImageForm({
    name: template.name,
    imageUrl: template.image_url,
    tags: template.tags,
  });
};
```

### Admin: Delete Template
```typescript
const handleDeleteTemplate = async (id) => {
  if (!confirm('Delete this template?')) return;
  
  await supabase
    .from('background_images')
    .delete()
    .eq('id', id);
    
  loadBackgroundImages();
};
```

### User: Fetch Templates
```typescript
const fetchTemplates = async () => {
  const { data } = await supabase
    .from('background_images')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
    
  setTemplates(data);
};
```

### User: Category Filter
```typescript
const [category, setCategory] = useState('all');

const filtered = category === 'all' 
  ? templates 
  : templates.filter(t => t.category === category);
```

### User: Track Usage
```typescript
await supabase.rpc('increment_template_usage', {
  template_uuid: templateId
});

await supabase.from('template_usage').insert({
  template_id: templateId,
  user_id: user.id,
  applied_to: 'card'
});
```

---

## 🎨 Categories List

```typescript
const categories = [
  'abstract',
  'nature',
  'professional',
  'creative',
  'minimal',
  'tech',
  'luxury',
  'gradient',
  'dark'
];
```

---

## 🐛 Common Fixes

### Templates not showing?
```typescript
// Check RLS policy
// Verify is_active = true
// Check browser console
```

### Can't edit/delete?
```sql
-- Verify admin role
SELECT * FROM user_roles WHERE user_id = 'your-user-id';
```

### Image preview broken?
```typescript
// Add error handler
<img 
  src={url} 
  onError={(e) => e.target.src = 'fallback.jpg'}
/>
```

### Search not working?
```typescript
// Ensure tags is array
tags: template.tags || []

// Check search logic includes all fields
template.name.includes(query) ||
template.tags.some(tag => tag.includes(query))
```

---

## 📁 File Locations

```
src/
├── pages/
│   ├── Admin.tsx          ← Edit here (admin features)
│   └── Templates.tsx      ← Edit here (user features)
└── integrations/
    └── supabase/
        └── client.ts      ← Already configured

.gemini/
├── database_schema_templates.sql    ← Run in Supabase
├── TEMPLATE_ENHANCEMENT_PLAN.md     ← Full details
├── IMPLEMENTATION_GUIDE.md          ← Step-by-step
└── SUMMARY.md                       ← Overview
```

---

## ⚡ Performance Tips

```typescript
// Debounce search
const debouncedSearch = useMemo(
  () => debounce((query) => setSearchQuery(query), 300),
  []
);

// Lazy load images
<img loading="lazy" src={url} />

// Cache templates
const { data } = useQuery('templates', fetchTemplates, {
  staleTime: 5 * 60 * 1000 // 5 minutes
});
```

---

## 🔒 Security Checklist

- [ ] RLS policies enabled
- [ ] Admin role verified
- [ ] Image URLs validated
- [ ] File size limits set
- [ ] CORS configured
- [ ] Error handling added

---

## 📊 Testing Commands

```sql
-- Test admin access
SELECT * FROM background_images; -- Should see all

-- Test user access (as non-admin)
SELECT * FROM background_images WHERE is_active = true; -- Should see active only

-- Test usage tracking
SELECT * FROM template_usage WHERE user_id = 'your-id';

-- Test popular templates
SELECT * FROM get_popular_templates(5);
```

---

## 🎯 Success Metrics

After implementation, verify:
- ✅ Admin can CRUD templates
- ✅ Users can browse templates
- ✅ Search returns correct results
- ✅ Filters work properly
- ✅ Usage is tracked
- ✅ No console errors
- ✅ RLS policies working

---

## 📞 Quick Links

- **Full Plan**: `TEMPLATE_ENHANCEMENT_PLAN.md`
- **SQL Schema**: `database_schema_templates.sql`
- **Implementation**: `IMPLEMENTATION_GUIDE.md`
- **Summary**: `SUMMARY.md`

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Database setup | 5 min |
| Admin preview | 10 min |
| Admin edit/delete | 20 min |
| User DB connection | 15 min |
| User filters | 15 min |
| Testing | 15 min |
| **Total** | **~80 min** |

---

**Print this page for quick reference during implementation!** 📄
