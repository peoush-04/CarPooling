************* CAR POOLING SYSTEM ****************

-> Built the backend of the project using MERN stack (MongoDB, Express.js, React.js, Node.js), it offers secure authentication, ride creation,     intelligent ride matching, real-time messaging, privacy protection, and emergency services.


-> Project Structure :
/backend
  ├── /config          # connection to database
  ├── /controllers     # contains all business logic for handling API requests
  ├── /middlewares     # Authentication and authorization middleware
  ├── /models          # Database schemas (Users, Rides, Messages)
  ├── /routes          # API route handlers
  ├── /utils           # Helper functions (JWT, Twilio SMS, etc.)
  ├── server.js        # Main entry point of the backend
  ├── package.json     # Dependencies and scripts
  ├── .env             # Environment variables (ignored in Git)


  -> All API routes with use :
    - /api/auth/register    	        Registers a new user (POST)
    - /api/auth/login	    	        Logs in a user (POST)
    - /api/auth/logout	    	        Logs out a user (POST)

    - /api/users/profile		        Fetches user profile (GET)
    - /api/users/profile		        Updates user profile (PUT)
    - /api/users/privacy                Enables privacy features like hide full name and blur profile picture (PUT)
    - /api/users/emergency-contacts		Adds emergency contacts (POST)
    - /api/users/sendSMS		        Sends an SMS alert to a user (POST)

    - /api/rides/create		            Creates a new ride (can be assessed only by drivers) (POST)
    - /api/rides/find		            Searches for available rides (can be assessed only by riders) (GET)
    - /api/rides/request		        Sends a request to join a ride (can be assessed only by riders) (POST)
    - /api/rides/respond		        Approves or rejects a ride request (can be assessed only by riders) (PUT)
    - /api/rides/share-location         Shares live location to emergency contacts (POST)
    
    - /api/messages/send		        Sends a message between users (POST)
    - /api/messages/:receiverId	 	    Fetches chat history (GET)
    
    
Detailed breakdown :
-> server.js - Entry point
        Loads environment variables.
        Connects to the MongoDB database.
        Sets up Express.js middleware.
        Defines API routes

-> authController.js - for authentication and authorization
        POST /api/auth/register  →  Registers a new user ensuring unique email ,unique phone number,secure password hashing ans role-based access 
        POST /api/auth/login     →  Authenticates the user using JWT token
        POST /api/auth/logout    →  Clears the authentication cookie.

-> userController.js - Handles profile management, privacy settings, and emergency contacts.
        Privacy settings allow users to hide full name and blur profile picture for extra privacy
        Emergency contacts allows users to store trusted contacts. Twilio sends SMS alerts in case of emergencies

-> rideController.js - Manages ride creation, ride search, and ride requests.
        Route Matching Algorithm (Intelligent Ride Search) - Find the best ride for a user by considering proximity, timing, and preferences.
        Scoring Breakdown:

        Location Match (40%):
            If pickup and drop match exactly → Full Score // 1
            If nearby locations match → Partial Score     //0.5
        Timing Similarity (40%):
            If departure time difference ≤ 15 mins → Best Match // 1
            If departure time difference ≤ 30 mins → Medium Match // 0.8
            If departure time difference ≤ 1 hour → Low Match // 0.5
            Otherwise, very weak match. //0.2
        Preference Match (20%):
            If user preferences match (smoking, pets, music, etc.) → Higher Score   //preferenceMatch = matchCount / totalPrefs
            If preferences don’t match → Lower Score

        (weightage: Location 40%, Timing 40%, Preferences 20%)
        Final score = (locationMatch * 0.4) + (timingMatch * 0.4) + (preferenceMatch * 0.2);

-> messageController.js - in app messaging System
        End-to-End encrypted messaging
        Driver & Rider communication only
        Uses MongoDB for message storage.

-> twilioService.js - Twilio SMS Integration
        Ride Approval/Rejection Notifications
        Emergency Location Alerts (Live location shared with trusted contacts)
