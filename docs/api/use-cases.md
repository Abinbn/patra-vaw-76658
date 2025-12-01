# Patra API - Use Cases

Real-world examples of what you can build with the Patra API.

## 1. Quick User Onboarding

**Problem:** Creating user accounts is time-consuming, requiring users to fill out lengthy forms.

**Solution:** Use Patra's Quick Create API to instantly create user accounts by just providing their Patra username.

```javascript
// User just enters their Patra username
const patraUsername = 'johndoe';

// Fetch all their details from Patra
const user = await patra.users.quickCreate({ patraUsername });

// User is now registered with full profile!
console.log(user);
// {
//   displayName: "John Doe",
//   email: "john@example.com",
//   jobTitle: "Software Engineer",
//   company: "Tech Corp",
//   avatarUrl: "https://...",
//   socialLinks: [...]
// }
```

**Benefits:**
- ⚡ Instant registration
- ✅ Pre-verified information
- 🎨 Professional profile from day one
- 📱 Social links automatically imported

---

## 2. Team Directory

**Problem:** Maintaining an up-to-date team directory is manual work.

**Solution:** Embed Patra cards that auto-update when team members update their profiles.

```html
<!-- Team page that's always current -->
<div class="team-grid">
  <div class="patra-embed" data-user="ceo"></div>
  <div class="patra-embed" data-user="cto"></div>
  <div class="patra-embed" data-user="designer"></div>
</div>
<script src="https://patra.app/embed.js" async></script>
```

**Benefits:**
- 🔄 Auto-updates when profiles change
- 💼 Professional appearance
- 📧 Contact info always current
- 🔗 Direct links to social profiles

---

## 3. Event Networking Platform

**Problem:** Attendees want to connect but exchanging contact info is awkward.

**Solution:** QR code badges powered by Patra cards.

```javascript
// Generate QR code for each attendee
const attendee = await patra.cards.get('johndoe');
const qrCode = attendee.qrCodeUrl;

// Print on badge
printBadge({
  name: attendee.displayName,
  company: attendee.company,
  qrCode: qrCode
});

// Track scans with webhooks
patra.webhooks.on('contact.shared', (event) => {
  console.log(`${event.data.username} shared their contact!`);
  // Send follow-up email, add to CRM, etc.
});
```

**Benefits:**
- 📱 Contactless networking
- 📊 Track connections
- 🎯 Follow-up automation
- 💾 Digital business cards

---

## 4. CRM Auto-Sync

**Problem:** Keeping CRM data in sync with user profiles is manual.

**Solution:** Use webhooks to automatically update your CRM when Patra cards change.

```javascript
// Webhook handler
app.post('/webhooks/patra', async (req, res) => {
  const event = req.body;
  
  if (event.event === 'card.updated') {
    // Auto-sync to CRM
    await crmClient.updateContact({
      id: event.data.id,
      name: event.data.displayName,
      email: event.data.email,
      jobTitle: event.data.jobTitle,
      company: event.data.company,
      phone: event.data.phone,
      linkedIn: event.data.socialLinks.linkedin
    });
    
    console.log('CRM updated automatically!');
  }
  
  res.status(200).send('OK');
});
```

**Benefits:**
- 🔄 Always up-to-date
- ⚡ No manual data entry
- ✅ Reduced errors
- 🎯 Better data quality

---

## 5. Blog Author Profiles

**Problem:** Author bios get outdated and are hard to maintain.

**Solution:** Embed live Patra cards in blog posts.

```html
<!-- In your blog post -->
<article>
  <h1>10 Tips for Better Code</h1>
  
  <div class="author-bio">
    <div class="patra-embed" 
         data-user="johndoe" 
         data-theme="light"
         data-width="300"
         data-height="400">
    </div>
  </div>
  
  <div class="content">
    <!-- Article content -->
  </div>
</article>
<script src="https://patra.app/embed.js" async></script>
```

**Benefits:**
- 📝 Always current
- 🔗 Direct social links
- 💼 Professional appearance
- 📧 Easy contact

---

## 6. Job Application Platform

**Problem:** Resumes are static and hard to verify.

**Solution:** Let candidates apply with their Patra username.

```javascript
// Application form
<form onSubmit={handleSubmit}>
  <input 
    name="patraUsername" 
    placeholder="Your Patra username"
  />
  <button>Apply with Patra</button>
</form>

// Backend
async function handleApplication(patraUsername) {
  // Fetch verified profile
  const candidate = await patra.cards.get(patraUsername);
  
  // Create application with rich data
  await createApplication({
    name: candidate.displayName,
    email: candidate.email,
    phone: candidate.phone,
    linkedin: candidate.socialLinks.linkedin,
    portfolio: candidate.website,
    bio: candidate.bio,
    profileUrl: `https://patra.app/${patraUsername}`
  });
}
```

**Benefits:**
- ✅ Verified information
- 🔗 Portfolio & social links
- ⚡ Quick applications
- 📊 Structured data

---

## 7. Conference Speaker Directory

**Problem:** Speaker info needs to be collected and displayed.

**Solution:** Speakers provide Patra usernames, you auto-populate everything.

```javascript
// Admin adds speaker
const speaker = await patra.cards.get('johndoe');

// Auto-populate speaker page
await createSpeakerPage({
  name: speaker.displayName,
  bio: speaker.bio,
  photo: speaker.avatarUrl,
  company: speaker.company,
  title: speaker.jobTitle,
  twitter: speaker.socialLinks.twitter,
  linkedin: speaker.socialLinks.linkedin,
  website: speaker.website
});

// Embed on conference site
<div class="speakers">
  <div class="patra-embed" data-user="speaker1"></div>
  <div class="patra-embed" data-user="speaker2"></div>
</div>
```

**Benefits:**
- ⚡ Fast setup
- 📸 Professional photos
- 🔗 Social verification
- 🔄 Auto-updates

---

## 8. Customer Portal

**Problem:** Users have to re-enter their info for every service.

**Solution:** One-click profile import from Patra.

```javascript
// "Import from Patra" button
async function importFromPatra(username) {
  const profile = await patra.cards.get(username);
  
  // Pre-fill all forms
  setUserProfile({
    fullName: profile.displayName,
    email: profile.email,
    phone: profile.phone,
    company: profile.company,
    jobTitle: profile.jobTitle,
    avatar: profile.avatarUrl,
    address: profile.location
  });
  
  toast.success('Profile imported!');
}
```

**Benefits:**
- ⚡ Instant setup
- ✅ Accurate data
- 😊 Better UX
- 🔒 Verified info

---

## 9. Email Signature Manager

**Problem:** Creating professional email signatures is tedious.

**Solution:** Generate signatures from Patra cards.

```javascript
// Generate email signature
const card = await patra.cards.get('johndoe');

const signature = `
<div style="font-family: Arial, sans-serif;">
  <img src="${card.avatarUrl}" width="80" style="border-radius: 50%;">
  <div>
    <strong>${card.displayName}</strong><br>
    ${card.jobTitle} at ${card.company}<br>
    📧 ${card.email} | 📱 ${card.phone}<br>
    <a href="${card.socialLinks.linkedin}">LinkedIn</a> | 
    <a href="${card.website}">Website</a>
  </div>
  <a href="https://patra.app/${card.username}">
    View my digital card
  </a>
</div>
`;
```

**Benefits:**
- 🎨 Professional design
- 🔄 Easy updates
- 🔗 Clickable links
- 📱 Mobile-friendly

---

## 10. Analytics Dashboard

**Problem:** Understanding card performance requires manual tracking.

**Solution:** Build analytics dashboards with Patra's API.

```javascript
// Fetch analytics
const analytics = await patra.cards.analytics('johndoe', {
  period: '30d'
});

// Display insights
console.log(`
  Total Views: ${analytics.views.total}
  Unique Visitors: ${analytics.views.unique}
  Contact Downloads: ${analytics.contactDownloads}
  Top Country: ${analytics.topLocations[0].country}
  Most Clicked Link: ${analytics.linkClicks.linkedin}
`);

// Track with webhooks
patra.webhooks.on('analytics.milestone', (event) => {
  if (event.data.milestone === '1000_views') {
    sendCelebrationEmail(event.data.username);
  }
});
```

**Benefits:**
- 📊 Real-time insights
- 🎯 Track engagement
- 🏆 Milestone notifications
- 📈 Growth metrics

---

## More Ideas

- **Virtual Business Cards**: Replace physical cards
- **Membership Directories**: Auto-updating member lists
- **Referral Programs**: Track who shared your card
- **Lead Generation**: Capture contact shares
- **Portfolio Websites**: Embed your card
- **Zoom Profiles**: Link to your Patra card
- **LinkedIn Bio**: Add your Patra link
- **GitHub Profile**: Showcase your card

## Get Started

Ready to build? Check out our [Getting Started Guide](./getting-started.md) or explore the [API Reference](./endpoints.md).
