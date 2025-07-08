# TravelAgentic Profile Preferences

## System Interaction Preferences

This section defines how users prefer to interact with the TravelAgentic system itself, separate from their travel preferences.

### Automation & Control

#### Automation Level
- **automation_level** - User's preferred automation level (0-10 scale)
  - 0-2: Manual approval required for every selection
  - 3-5: Auto-select obvious choices, ask for approval on complex decisions
  - 6-8: Auto-select most options, only ask for approval on high-impact decisions
  - 9-10: Full automation, only interrupt for critical failures

#### Fallback System
- **fallback_comfort** - Which fallback methods user is comfortable with
  - API retries (always enabled)
  - Browser automation (yes/no/ask)
  - Voice calling (yes/no/ask)
  - Manual input requests (yes/no/ask)
- **intervention_threshold** - When user wants to be notified about fallback attempts
  - Immediate notification
  - After primary API fails
  - After secondary API fails
  - Only for manual intervention

### Trip Management

#### Trip History & Templates
- **trip_history_retention** - How long to keep trip history
  - 30 days, 90 days, 1 year, indefinite
- **template_sharing** - Willingness to share/import trip templates
  - Private only, share with friends, public sharing, import from others
- **proxy_trip_creation** - Comfort level with creating trips for others
  - Disabled, family only, friends, anyone with permission

#### Trip Organization
- **trip_naming_style** - Preferred trip naming convention
  - Auto-generate, custom names, date-based, destination-based
- **trip_comparison** - Enable side-by-side trip comparison
- **duplicate_trip_handling** - How to handle similar trips
  - Ask each time, auto-merge, keep separate

### Booking Process

#### Purchase Flow
- **booking_review_style** - Level of detail in purchase review
  - Quick summary, detailed breakdown, itemized review
- **payment_confirmation** - Required confirmation steps for purchases
  - Single confirmation, double confirmation, email verification
- **cart_timeout** - How long to hold selections before expiring
  - 15 minutes, 30 minutes, 1 hour, 4 hours, 24 hours
- **price_change_handling** - How to handle price changes during booking
  - Auto-accept increases under 5%, always ask, cancel if increased

#### Booking Notifications
- **booking_status_updates** - Frequency of booking progress updates
  - Real-time, major milestones only, completion only
- **booking_confirmation_delivery** - How to receive booking confirmations
  - Email, SMS, push notification, in-app only
- **booking_failure_alerts** - How to handle booking failures
  - Immediate alert, retry automatically, escalate to manual

### Agent Interaction

#### Recommendation Style
- **agent_interaction_style** - How to present agent recommendations
  - Sequential (one category at a time), parallel (all categories), mixed
- **recommendation_detail_level** - Amount of detail in recommendations
  - Brief overview, moderate detail, comprehensive analysis
- **alternative_options** - Number of alternatives to show per category
  - Top choice only, 3 options, 5 options, 10 options

#### AI Communication
- **explanation_depth** - Level of AI reasoning explanation
  - None, basic rationale, detailed reasoning
- **confidence_display** - Show AI confidence levels
  - Hidden, percentage, verbal description
- **learning_feedback** - Allow AI to learn from user choices
  - Enabled, disabled, ask permission

### Communication & Notifications

#### Progress Updates
- **progress_updates** - Frequency and detail of progress notifications
  - Silent, major milestones, detailed progress, real-time
- **manual_intervention_alerts** - How to handle fallback warnings
  - Push notification, email, SMS, in-app banner
- **search_progress_display** - Show search progress across agents
  - Hidden, progress bar, detailed status, agent-by-agent

#### Contact Preferences
- **preferred_contact_method** - Primary communication channel
  - Email, SMS, push notification, phone call
- **contact_hours** - When system can contact user
  - Anytime, business hours only, custom schedule
- **urgency_escalation** - How to escalate urgent issues
  - Same channel, escalate to phone, escalate to email

### Output & Itinerary

#### Itinerary Format
- **itinerary_format** - Preferred itinerary delivery format
  - PDF email, interactive web view, mobile app, printed mail
- **itinerary_detail_level** - Comprehensive vs summary format
  - Essential info only, standard detail, comprehensive guide
- **todo_inclusion** - What types of todos to include
  - None, essential only, comprehensive checklist
- **itinerary_branding** - Include TravelAgentic branding
  - Minimal, standard, full branding, custom branding

#### Sharing & Privacy
- **sharing_preferences** - Who can access completed itineraries
  - Private only, travel companions, family, custom sharing
- **social_sharing** - Allow sharing to social media
  - Disabled, ask permission, auto-share highlights
- **data_retention** - How long to keep personal data
  - Trip duration only, 1 year, 5 years, indefinite

### User Experience

#### Interface Preferences
- **ui_complexity** - Interface complexity level
  - Simplified, standard, advanced, expert
- **tutorial_preferences** - Onboarding and help preferences
  - Skip tutorials, basic guidance, comprehensive help
- **error_handling_style** - How to present errors
  - Brief messages, detailed explanations, troubleshooting steps

#### Accessibility
- **accessibility_needs** - System accessibility requirements
  - Screen reader support, high contrast, large text, keyboard navigation
- **language_preference** - System language
  - Auto-detect, specific language, multilingual support
- **timezone_handling** - How to handle time zones
  - Auto-detect, manual selection, always show local time

### Implementation Notes

- All preferences should have sensible defaults
- Allow partial preference completion with smart defaults
- Support preference profiles (business vs leisure)
- Enable preference import/export for account migration
- Provide preference reset to defaults option
- Consider A/B testing optimal default values
- Track preference changes to improve system UX 