# CS554 Final Project - Try & Cache

The web application is for house owners/managers (lessors) to create listings of their property and for tenants to find their perfect house and apply for them.

## Features Overview

- Search for the listings according to respective localities, see the most popular localities, and an option to create a listing (if you are signed in as a lessor), and also view the available listings for the searched locality on a map
- **Lessor Dashboard:** If you are signed in as a lessor you can see the listings created by you and the applications for your listings here
- **My Applications:** If you are signed in as a tenant, you can see all your applications here
- **Apply for a Listing:** Apply for a listing you are interested in with an option to attach references, credit score, or any other documents to make your application stronger than others
- **Find a Tenant:** Get applications for your listings, reject them straight away, or approve them along with an option to ask for additional documents and proofs. At this point, you can also share an optional terms and conditions document for the tenant.
- **Application Fee:** Using the stripe checkout session, complete your application for a listing by paying an application fee

## Course Technologies Used

- React
- TypeScript (Only for the frontend)
- Redis: To cache search results and rank the most popular localities based on how many time it has been searched

## Independent Technologies Used

- AWS S3 Bucket: To store all the media across the web app
- Stripe: For application fees payment
- Google Maps Platform (Places API): To get the coordinates of the listing, the search box area, and to display search listings on a map

## Prerequisites

We have used most of the technologies as their cloud-deployed version so the only prerequisite is that you are running Node v16.60 or above

## Setup

### 1. Install dependencies

Install npm dependencies in both the `client` and `server` sub-directories and also the root directory.

```bash
# root directory
npm i

# checkout to server and install dependencies
cd server
npm i

# checkout to client and install dependencies
cd ../client
npm i
```

The root directory has been initialized as an npm project and installs `concurrently` as a dev dependency to start both the client and the server with a single command

### Set up environment variables

> **NOTE:** If you are the grader, you should have the populated `.env` in the submission zip so you can skip this step

You need to create `.env` files in both `client` and `server` directories, you can also refer to the `.env.example` included in the same location where the `.env` file should be created

#### In `client` directory

```ini
REACT_APP_GOOGLE_MAPS_API_KEY= // Your Google Maps API key
REACT_APP_SERVER_URL= // Endpoint to the Express server ("http://localhost:4000")
```

#### In `server` directory

```ini
MONGODB_URL= // Endpoint to MongoDB server
MONGODB_DATABASE= // Name of the database
JWT_SECRET= // Secret string to create JWT
S3_BUCKET_NAME= // Name of AWS S3 bucket
S3_BUCKET_REGION= // Region of your AWS S3 bucket
S3_ACCESS_KEY=
S3_SECRET_ACCESS_KEY=
STRIPE_SK= // Stripe secret key to create checkout sessions
CLIENT_URL= // Endpoint on which the client would be running ("http://localhost:3000")
SERVER_PORT= // Port on which server would be running (4000)
GOOGLE_MAPS_API_KEY= // Your Google Maps API key
REDIS_CLOUD_PASSWORD= // Password to Redis Cloud
REDIS_CLOUD_HOST= // Endpoint for Redis Cloud
REDIS_CLOUD_PORT= // Access port to the Redis Cloud Server
```

## Running the Application

You could either start the entire application from the root directory:

```bash
npm start
```

Or you could `cd` into `client` and `server` separately (you will have to use 2 different instances of the terminal) and start each one individually:

```bash
# start the server first (Express App)
cd server
npm start
```

```bash
# start the client (React App)
cd client
npm start
```

Now if you didn't change any of the configurations mentioned above or the Port, the applications should be running on:

- Server: `http://localhost:4000` and
- Client: `http://localhost:3000`

## The Team

- [Abhishek Khatri](https://github.com/khatri7)
- [Abhishek Kocharekar](https://github.com/abhishekkocharekar)
- [Nihal Sanjay Palled](https://github.com/nihalpalled)
- [Syed Safiuddin](https://github.com/syedsafi30)
- [Yash Bharambay](https://github.com/YashBharambay)
