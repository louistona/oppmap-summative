# OpportunityMap

A digital platform that helps entrepreneurs identify undereserved regions in Africa where they can launch impactful ventures by visualizing development challenges on an interactive map.

## Features

### Core MVP Features
- **Interactive Challenge Map**: Display geographic regions with development challenge markers
- **Challenge Discovery & Filtering**: Filter challenges by category, severity level, and search by region
- **User Authentication**: Simple registration/login with Google OAuth integration
- **Personal Dashboard**: Bookmark interesting regions, view saved opportunities, submit solution ideas
- **Admin Management**: Add/edit challenge data, moderate user-submitted solutions

### Technical Stack
- **Frontend**: React.js with responsive design
- **Backend**: Supabase (PostgreSQL with PostGIS for spatial data)
- **Maps**: Leaflet integration
- **Authentication**: Supabase Auth with JWT tokens
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/louistona/oppmap-summative.git
   cd opportunitymap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase(Optional you can leave the one already attached)**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Run the database schema setup (see Database Setup section)

4. **Environment setup**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

### Database Setup

1. **Enable PostGIS extension**
   In your Supabase SQL editor, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Run the schema setup**
   Copy and execute the SQL queries from `src/services/supabase.js` (SCHEMA_QUERIES constant) in your Supabase SQL editor.

3. **Add sample data** (optional)
   ```sql
   -- Sample challenges
   INSERT INTO challenges (title, description, category, severity, location, region_name, population_affected, statistics) VALUES
   ('Limited Access to Clean Water', 'Many rural communities lack access to clean drinking water', 'health', 4, ST_GeogFromText('POINT(36.8219 -1.2921)'), 'Nairobi County', 50000, '{"water_access_rate": "40%", "disease_prevalence": "high"}'),
   ('Low School Enrollment', 'Primary school enrollment rates below national average', 'education', 3, ST_GeogFromText('POINT(34.7519 -0.0917)'), 'Kisumu County', 75000, '{"enrollment_rate": "65%", "dropout_rate": "25%"}'),
   ('Poor Road Infrastructure', 'Limited road connectivity affecting market access', 'infrastructure', 3, ST_GeogFromText('POINT(37.9062 -0.0236)'), 'Meru County', 30000, '{"road_density": "low", "market_access": "limited"}');
   ```

## Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── common/          # Shared components
│   ├── dashboard/       # User dashboard components
│   ├── map/            # Map-related components
│   └── admin/          # Admin panel components
├── contexts/           # React contexts
├── hooks/             # Custom React hooks
├── services/          # API services
├── styles/           # CSS files
└── utils/           # Utility functions
```

## Usage

### For Entrepreneurs
1. **Explore the Map**: Browse challenges across different regions
2. **Filter Opportunities**: Use filters to find challenges matching your interests
3. **Bookmark Challenges**: Save interesting opportunities for later
4. **Submit Solutions**: Propose innovative solutions to challenges

### For Administrators
1. **Manage Challenges**: Add, edit, and delete challenge data
2. **Moderate Solutions**: Review and approve user-submitted solutions
3. **Monitor Activity**: View platform statistics and user engagement

## API Reference

### Authentication
- POST `/auth/signup` - User registration
- POST `/auth/signin` - User login
- POST `/auth/signout` - User logout

### Challenges
- GET `/challenges` - Get all challenges (with filters)
- GET `/challenges/:id` - Get specific challenge
- POST `/challenges` - Create challenge (admin only)
- PUT `/challenges/:id` - Update challenge (admin only)
- DELETE `/challenges/:id` - Delete challenge (admin only)

### Solutions
- GET `/solutions` - Get solutions for challenge
- POST `/solutions` - Submit new solution
- PUT `/solutions/:id/status` - Update solution status (admin only)

### User Data
- GET `/user/bookmarks` - Get user bookmarks
- POST `/user/bookmarks` - Add bookmark
- DELETE `/user/bookmarks/:id` - Remove bookmark

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
# Upload build folder to your hosting provider
```

## Environment Variables

```bash
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Common Issues

1. **Map not loading**: Check if Leaflet CSS is properly imported
2. **Authentication errors**: Verify Supabase credentials and RLS policies
3. **Database errors**: Ensure PostGIS extension is enabled and schema is set up correctly

### Performance Optimization

1. **Map performance**: Consider implementing marker clustering for large datasets
2. **Database queries**: Add indexes for frequently queried columns
3. **Image optimization**: Compress and optimize any images used

## License

This project is licensed under the MIT License - see the LICENSE file for details.


## Roadmap

### Phase 1 (Current MVP)
- [x] Interactive map with challenge markers
- [x] User authentication and dashboards
- [x] Basic filtering and search
- [x] Solution submission system
- [x] Admin panel for content management

### Phase 2 (Future Enhancements)
- [ ] Advanced analytics and reporting
- [ ] Real-time collaboration features
- [ ] Mobile app development
- [ ] Integration with external data sources
- [ ] Multi-language support
- [ ] Enhanced geospatial analysis tools
- [ ] Community features and forums
- [ ] Impact tracking and measurement

### Phase 3 (Advanced Features)
- [ ] AI-powered opportunity matching
- [ ] Blockchain-based solution verification
- [ ] Integration with funding platforms
- [ ] Advanced data visualization
- [ ] Predictive analytics for emerging challenges
-
