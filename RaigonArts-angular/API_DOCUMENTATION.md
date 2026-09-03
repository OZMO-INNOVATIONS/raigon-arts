# Raigon Arts — REST API Specification & Documentation

> **System**: Raigon Arts Custom Photo Framing & Customer Management System  
> **Base URL**: `https://api.raigonarts.com/api/v1` (Production) / `http://localhost:3000/api/v1` (Development)  
> **Content-Type**: `application/json`  
> **Authentication**: Bearer Token via `Authorization: Bearer <JWT_TOKEN>`  
> **Version**: `v2.4.0`

---

## Table of Contents
1. [Architecture & Global Standards](#1-architecture--global-standards)
2. [Authentication & Account Recovery APIs](#2-authentication--account-recovery-apis)
3. [Dashboard & Statistics APIs](#3-dashboard--statistics-apis)
4. [Customer Management APIs](#4-customer-management-apis)
5. [Order Management APIs](#5-order-management-apis)
6. [Photo Gallery & Upload APIs](#6-photo-gallery--upload-apis)
7. [Frame Size Management APIs](#7-frame-size-management-apis)
8. [Financial & Production Reports APIs](#8-financial--production-reports-apis)
9. [Workshop & System Settings APIs](#9-workshop--system-settings-apis)
10. [Notifications APIs](#10-notifications-apis)
11. [Data Backup & Restore APIs](#11-data-backup--restore-apis)
12. [Global Error Codes & Response Schemas](#12-global-error-codes--response-schemas)

---

## 1. Architecture & Global Standards

### Global Response Wrapper Format
All successful REST API responses adhere to the following JSON structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation executed successfully.",
  "data": {},
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

### Global Error Response Format
All error responses adhere to the standard error structure:

```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Validation failed on input fields.",
  "errors": [
    {
      "field": "phone",
      "message": "Phone number must be a valid 10-digit Indian phone number."
    }
  ],
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

## 2. Authentication & Account Recovery APIs

### 2.1 Sign In / Login
* **Method**: `POST`
* **Endpoint**: `/auth/login`
* **Description**: Authenticates workshop staff / manager using username or registered phone number and returns a JWT session token.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "username": "admin",
  "password": "raigon2026"
}
```

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Authentication successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MjUyODgwMDB9...",
    "expiresIn": 86400,
    "user": {
      "id": "usr_01",
      "username": "admin",
      "displayName": "Workshop Manager",
      "role": "ADMIN",
      "registeredPhone": "+91 7902261255"
    }
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

#### Response Body (`401 Unauthorized`)
```json
{
  "success": false,
  "statusCode": 401,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid username or password. Please try again.",
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 2.2 Send Forgot Password OTP (Step 1)
* **Method**: `POST`
* **Endpoint**: `/auth/forgot-password/send-otp`
* **Description**: Initiates the 3-step WhatsApp OTP recovery flow by dispatching a 4-digit OTP code to the database registered number.

#### Request Body
```json
{
  "phone": "+91 7902261255"
}
```

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "4-digit OTP has been sent via WhatsApp to +91 7902261255.",
  "data": {
    "sessionId": "otp_sess_9a8b7c6d5e",
    "targetPhone": "+91 7902261255",
    "expiresInSeconds": 80,
    "resendAvailableInSeconds": 80
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 2.3 Verify WhatsApp OTP (Step 2)
* **Method**: `POST`
* **Endpoint**: `/auth/forgot-password/verify-otp`
* **Description**: Verifies the 4-digit verification code entered by the user.

#### Request Body
```json
{
  "sessionId": "otp_sess_9a8b7c6d5e",
  "otpCode": "4829"
}
```

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP verified successfully. Proceed to set new password.",
  "data": {
    "resetToken": "rst_tok_a1b2c3d4e5f6g7h8",
    "expiresInSeconds": 600
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

#### Response Body (`400 Bad Request - Invalid OTP`)
```json
{
  "success": false,
  "statusCode": 400,
  "error": "INVALID_OTP",
  "message": "The verification code entered is invalid or has expired.",
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 2.4 Submit New Password (Step 3)
* **Method**: `POST`
* **Endpoint**: `/auth/forgot-password/reset-password`
* **Description**: Commits the new workshop password and invalidates recovery tokens.

#### Request Body
```json
{
  "resetToken": "rst_tok_a1b2c3d4e5f6g7h8",
  "newPassword": "newSecurePassword2026",
  "confirmPassword": "newSecurePassword2026"
}
```

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password updated successfully. Please log in with your new credentials.",
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 2.5 Current Authenticated User Info
* **Method**: `GET`
* **Endpoint**: `/auth/me`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "userId": "usr_01",
    "username": "admin",
    "displayName": "Raigon Workshop Manager",
    "registeredPhone": "+91 7902261255",
    "role": "ADMIN",
    "permissions": ["READ", "WRITE", "DELETE", "EXPORT", "SETTINGS"]
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

## 3. Dashboard & Statistics APIs

### 3.1 Get Dashboard Metric Summary
* **Method**: `GET`
* **Endpoint**: `/dashboard/stats`
* **Description**: Returns summary KPI counts for the 5 dashboard stat cards.

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalOrdersCount": 42,
    "totalOrdersGrowth": "+12%",
    "inProgressCount": 16,
    "inProgressStatus": "Active in workshop",
    "completedOrdersCount": 24,
    "completedStatus": "Ready for delivery",
    "pendingOrdersCount": 2,
    "pendingStatus": "Urgent action needed",
    "totalRevenue": 142500,
    "revenueGrowth": "+28%",
    "totalCustomersCount": 38,
    "totalFramesInProduction": 58
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 3.2 Get Recent Customer Frame Orders
* **Method**: `GET`
* **Endpoint**: `/dashboard/recent-orders`
* **Query Parameters**:
  * `limit` *(integer, optional, default: 10)*

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "ord_1006",
      "orderNumber": "RA-1006",
      "customerId": "cust_106",
      "customerName": "Arun Kumar",
      "customerPhone": "+91 7902261255",
      "customerCity": "Trivandrum",
      "frameSize": "12 × 18 inch",
      "frameType": "Wooden Frame",
      "quantity": 1,
      "totalAmount": 2500,
      "advancePaid": 1000,
      "balanceAmount": 1500,
      "orderStatus": "In Progress",
      "paymentStatus": "Partial",
      "orderDate": "2026-09-02",
      "deliveryDate": "2026-09-09"
    },
    {
      "id": "ord_1001",
      "orderNumber": "RA-1001",
      "customerId": "cust_101",
      "customerName": "Meera Nair",
      "customerPhone": "+91 9847123456",
      "customerCity": "Kochi",
      "frameSize": "12 × 18 inch",
      "frameType": "Wooden Frame",
      "quantity": 2,
      "totalAmount": 4500,
      "advancePaid": 0,
      "balanceAmount": 4500,
      "orderStatus": "Cancelled",
      "paymentStatus": "Unpaid",
      "orderDate": "2026-08-28",
      "deliveryDate": "2026-09-05"
    }
  ],
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

## 4. Customer Management APIs

### 4.1 List All Customers
* **Method**: `GET`
* **Endpoint**: `/customers`
* **Query Parameters**:
  * `search` *(string, optional)* — Filter by name, phone, city, or address
  * `page` *(integer, optional, default: 1)*
  * `limit` *(integer, optional, default: 50)*

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "total": 4,
    "page": 1,
    "limit": 50,
    "customers": [
      {
        "id": "cust_101",
        "name": "Arun Kumar",
        "phone": "+91 7902261255",
        "altPhone": "+91 9447000000",
        "city": "Trivandrum",
        "address": "Villa 42, Palm Meadows, Kowdiar",
        "pincode": "695003",
        "createdAt": "2026-08-20T10:00:00Z",
        "totalOrdersCount": 2,
        "totalSpent": 4800
      },
      {
        "id": "cust_102",
        "name": "Meera Nair",
        "phone": "+91 9847123456",
        "altPhone": "+91 7902261255",
        "city": "Kochi",
        "address": "4B Skyline Horizon, Marine Drive",
        "pincode": "682031",
        "createdAt": "2026-08-25T14:30:00Z",
        "totalOrdersCount": 1,
        "totalSpent": 3200
      }
    ]
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 4.2 Create New Customer
* **Method**: `POST`
* **Endpoint**: `/customers`

#### Request Body
```json
{
  "name": "Arun Kumar",
  "phone": "+91 7902261255",
  "altPhone": "+91 9447000000",
  "city": "Trivandrum",
  "address": "Villa 42, Palm Meadows, Kowdiar",
  "pincode": "695003"
}
```

#### Response Body (`201 Created`)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Customer profile created successfully.",
  "data": {
    "id": "cust_107",
    "name": "Arun Kumar",
    "phone": "+91 7902261255",
    "altPhone": "+91 9447000000",
    "city": "Trivandrum",
    "address": "Villa 42, Palm Meadows, Kowdiar",
    "pincode": "695003",
    "createdAt": "2026-09-03T11:05:00.000Z",
    "totalOrdersCount": 0,
    "totalSpent": 0
  },
  "timestamp": "2026-09-03T11:05:00.000Z"
}
```

---

### 4.3 Get Customer Profile & Order History
* **Method**: `GET`
* **Endpoint**: `/customers/:id`

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "customer": {
      "id": "cust_101",
      "name": "Arun Kumar",
      "phone": "+91 7902261255",
      "altPhone": "+91 9447000000",
      "city": "Trivandrum",
      "address": "Villa 42, Palm Meadows, Kowdiar",
      "pincode": "695003",
      "createdAt": "2026-08-20T10:00:00Z",
      "totalOrdersCount": 2,
      "totalSpent": 4800
    },
    "orders": [
      {
        "id": "ord_1001",
        "orderNumber": "RA-1001",
        "orderDate": "2026-08-28",
        "deliveryDate": "2026-09-05",
        "totalAmount": 4500,
        "advancePaid": 2000,
        "balanceAmount": 2500,
        "paymentStatus": "Partial",
        "orderStatus": "In Progress",
        "photos": [
          {
            "id": "p1",
            "photoUrl": "https://assets.raigonarts.com/photos/family_kowdiar.jpg",
            "photoName": "Family_Portrait_Kowdiar.jpg",
            "frameSize": "12 × 18 inch",
            "frameType": "Wooden Frame"
          }
        ]
      }
    ]
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 4.4 Update Customer Profile
* **Method**: `PUT`
* **Endpoint**: `/customers/:id`

#### Request Body
```json
{
  "name": "Arun Kumar Kowdiar",
  "phone": "+91 7902261255",
  "altPhone": "+91 9447112233",
  "city": "Trivandrum",
  "address": "Villa 42, Palm Meadows Phase 2, Kowdiar",
  "pincode": "695003"
}
```

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Customer profile updated successfully.",
  "data": {
    "id": "cust_101",
    "name": "Arun Kumar Kowdiar",
    "phone": "+91 7902261255",
    "altPhone": "+91 9447112233",
    "city": "Trivandrum",
    "address": "Villa 42, Palm Meadows Phase 2, Kowdiar",
    "pincode": "695003"
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 4.5 Delete Customer
* **Method**: `DELETE`
* **Endpoint**: `/customers/:id`

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Customer profile and associated references deleted successfully.",
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

## 5. Order Management APIs

### 5.1 List All Workshop Orders
* **Method**: `GET`
* **Endpoint**: `/orders`
* **Query Parameters**:
  * `status` *(string, optional)* — `All`, `In Progress`, `Pending`, `Completed`, `Cancelled`
  * `paymentStatus` *(string, optional)* — `Paid`, `Partial`, `Unpaid`
  * `search` *(string, optional)* — Order #, customer name, phone
  * `page` *(integer, optional)*
  * `limit` *(integer, optional)*

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "total": 6,
    "orders": [
      {
        "id": "ord_1006",
        "orderNumber": "RA-1006",
        "customerId": "cust_106",
        "customerName": "Arun Kumar",
        "customerPhone": "+91 7902261255",
        "customerCity": "Trivandrum",
        "orderDate": "2026-09-02",
        "deliveryDate": "2026-09-09",
        "totalAmount": 2500,
        "advancePaid": 1000,
        "balanceAmount": 1500,
        "paymentStatus": "Partial",
        "orderStatus": "In Progress",
        "configMode": "same",
        "photos": [
          {
            "id": "p6",
            "photoUrl": "https://assets.raigonarts.com/photos/gallery_memory.jpg",
            "photoName": "Gallery_Memory.jpg",
            "frameSize": "12 × 18 inch",
            "unit": "inch",
            "frameType": "Wooden Frame",
            "frameMaterial": "Teak Wood Moulding",
            "frameColor": "Walnut Brown",
            "orientation": "Landscape",
            "quantity": 1
          }
        ],
        "commonSpecs": {
          "frameSize": "12 × 18 inch",
          "unit": "inch",
          "customWidth": null,
          "customHeight": null,
          "frameType": "Wooden Frame",
          "frameMaterial": "Teak Wood Moulding",
          "frameColor": "Walnut Brown",
          "orientation": "Landscape",
          "quantity": 1,
          "notes": "Anti-glare glass coating with back mounting hook"
        },
        "createdAt": "2026-09-02T10:00:00Z"
      }
    ]
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 5.2 Create Customer & Frame Order (Combined Modal Submission)
* **Method**: `POST`
* **Endpoint**: `/orders`
* **Description**: Creates or links a customer profile and creates an active framing production order with uploaded photos and specs.

#### Request Body
```json
{
  "customer": {
    "id": null,
    "name": "Siddharth Menon",
    "phone": "+91 9447112233",
    "altPhone": "+91 9847001122",
    "city": "Trivandrum",
    "address": "Flat 3C, Royal Palms, Sasthamangalam",
    "pincode": "695010"
  },
  "order": {
    "configMode": "same",
    "orderDate": "2026-09-03",
    "deliveryDate": "2026-09-12",
    "totalAmount": 3800,
    "advancePaid": 1500,
    "paymentStatus": "Partial",
    "orderStatus": "In Progress",
    "commonSpecs": {
      "frameSize": "12 × 18 inch",
      "unit": "inch",
      "customWidth": null,
      "customHeight": null,
      "frameType": "Wooden Frame",
      "frameMaterial": "Teak Wood Moulding",
      "frameColor": "Walnut Brown",
      "orientation": "Landscape",
      "quantity": 2,
      "notes": "Clear float glass, white passe-partout 1-inch border"
    },
    "photos": [
      {
        "photoUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE...",
        "photoName": "Wedding_Reception_01.jpg",
        "frameSize": "12 × 18 inch",
        "unit": "inch",
        "frameType": "Wooden Frame",
        "frameMaterial": "Teak Wood Moulding",
        "frameColor": "Walnut Brown",
        "orientation": "Landscape",
        "quantity": 1
      },
      {
        "photoUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE...",
        "photoName": "Wedding_Reception_02.jpg",
        "frameSize": "12 × 18 inch",
        "unit": "inch",
        "frameType": "Wooden Frame",
        "frameMaterial": "Teak Wood Moulding",
        "frameColor": "Walnut Brown",
        "orientation": "Landscape",
        "quantity": 1
      }
    ]
  }
}
```

#### Response Body (`201 Created`)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Customer profile and frame order #RA-1007 created successfully.",
  "data": {
    "orderId": "ord_1007",
    "orderNumber": "RA-1007",
    "customerId": "cust_108",
    "customerName": "Siddharth Menon",
    "totalAmount": 3800,
    "advancePaid": 1500,
    "balanceAmount": 2300,
    "orderStatus": "In Progress",
    "paymentStatus": "Partial",
    "deliveryDate": "2026-09-12"
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 5.3 Update Order Status
* **Method**: `PATCH`
* **Endpoint**: `/orders/:id/status`

#### Request Body
```json
{
  "orderStatus": "Completed",
  "remarks": "Framing inspection passed, packed for client pickup."
}
```

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Order status updated to 'Completed'.",
  "data": {
    "id": "ord_1006",
    "orderNumber": "RA-1006",
    "orderStatus": "Completed",
    "updatedAt": "2026-09-03T11:15:00.000Z"
  },
  "timestamp": "2026-09-03T11:15:00.000Z"
}
```

---

### 5.4 Update Order & Payment Details
* **Method**: `PUT`
* **Endpoint**: `/orders/:id`

#### Request Body
```json
{
  "totalAmount": 2500,
  "advancePaid": 2500,
  "paymentStatus": "Paid",
  "orderStatus": "Completed",
  "deliveryDate": "2026-09-08"
}
```

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Order #RA-1006 updated successfully.",
  "data": {
    "id": "ord_1006",
    "orderNumber": "RA-1006",
    "totalAmount": 2500,
    "advancePaid": 2500,
    "balanceAmount": 0,
    "paymentStatus": "Paid",
    "orderStatus": "Completed"
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 5.5 Delete Order
* **Method**: `DELETE`
* **Endpoint**: `/orders/:id`

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Order #RA-1006 and associated attachments removed.",
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

## 6. Photo Gallery & Upload APIs

### 6.1 List Photo Collection
* **Method**: `GET`
* **Endpoint**: `/photos`
* **Query Parameters**:
  * `orientation` *(string, optional)* — `All`, `Landscape`, `Portrait`, `Square`
  * `search` *(string, optional)* — Filter by photo name or customer name

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "p1",
      "orderId": "RA-1001",
      "customerId": "cust_101",
      "customerName": "Arun Kumar",
      "photoName": "Family_Portrait_Kowdiar.jpg",
      "photoUrl": "https://assets.raigonarts.com/photos/family_kowdiar.jpg",
      "frameSize": "12 × 18 inch",
      "orientation": "Landscape",
      "uploadedAt": "2026-08-28T10:30:00Z"
    },
    {
      "id": "p2",
      "orderId": "RA-1002",
      "customerId": "cust_102",
      "customerName": "Meera Nair",
      "photoName": "Studio_Portraits.jpg",
      "photoUrl": "https://assets.raigonarts.com/photos/studio_portraits.jpg",
      "frameSize": "8 × 12 inch",
      "orientation": "Portrait",
      "uploadedAt": "2026-08-29T14:15:00Z"
    }
  ],
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 6.2 Multipart Photo File Upload
* **Method**: `POST`
* **Endpoint**: `/photos/upload`
* **Content-Type**: `multipart/form-data`

#### Form Fields
* `photos`: Array of file binaries (JPG, PNG, WEBP)
* `orderId` *(optional)*: String

#### Response Body (`201 Created`)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Photos uploaded successfully.",
  "data": [
    {
      "id": "p_upl_912",
      "photoName": "HighRes_Print_01.jpg",
      "photoUrl": "https://assets.raigonarts.com/uploads/2026/09/HighRes_Print_01.jpg",
      "fileSizeBytes": 4829104,
      "dimensions": {
        "width": 3600,
        "height": 2400
      },
      "mimeType": "image/jpeg"
    }
  ],
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

## 7. Frame Size Management APIs

### 7.1 List All Frame Sizes
* **Method**: `GET`
* **Endpoint**: `/frames`
* **Query Parameters**:
  * `search` *(string, optional)* — Filter by size code, name, category, or unit

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "f1",
      "code": "FS-01",
      "name": "4 × 6 inch",
      "width": 4,
      "height": 6,
      "unit": "inch",
      "category": "Standard Photo",
      "activeOrdersCount": 142,
      "status": "Active"
    },
    {
      "id": "f2",
      "code": "FS-02",
      "name": "5 × 7 inch",
      "width": 5,
      "height": 7,
      "unit": "inch",
      "category": "Standard Photo",
      "activeOrdersCount": 98,
      "status": "Active"
    },
    {
      "id": "f3",
      "code": "FS-03",
      "name": "8 × 10 inch",
      "width": 8,
      "height": 10,
      "unit": "inch",
      "category": "Medium Portrait",
      "activeOrdersCount": 210,
      "status": "Active"
    },
    {
      "id": "f4",
      "code": "FS-04",
      "name": "8 × 12 inch",
      "width": 8,
      "height": 12,
      "unit": "inch",
      "category": "Medium Portrait",
      "activeOrdersCount": 320,
      "status": "Active"
    },
    {
      "id": "f5",
      "code": "FS-05",
      "name": "12 × 18 inch",
      "width": 12,
      "height": 18,
      "unit": "inch",
      "category": "Large Gallery",
      "activeOrdersCount": 455,
      "status": "Active"
    },
    {
      "id": "f6",
      "code": "FS-06",
      "name": "16 × 20 inch",
      "width": 16,
      "height": 20,
      "unit": "inch",
      "category": "Large Gallery",
      "activeOrdersCount": 184,
      "status": "Active"
    },
    {
      "id": "f7",
      "code": "FS-07",
      "name": "20 × 30 inch",
      "width": 20,
      "height": 30,
      "unit": "inch",
      "category": "Exhibition Wall Art",
      "activeOrdersCount": 92,
      "status": "Active"
    }
  ],
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 7.2 Create New Frame Size
* **Method**: `POST`
* **Endpoint**: `/frames`

#### Request Body
```json
{
  "code": "FS-08",
  "name": "24 × 36 inch",
  "width": 24,
  "height": 36,
  "unit": "inch",
  "category": "Exhibition Wall Art"
}
```

#### Response Body (`201 Created`)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Frame size '24 × 36 inch' created.",
  "data": {
    "id": "f_size_08",
    "code": "FS-08",
    "name": "24 × 36 inch",
    "width": 24,
    "height": 36,
    "unit": "inch",
    "category": "Exhibition Wall Art",
    "activeOrdersCount": 0,
    "status": "Active"
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 7.3 Update Frame Size
* **Method**: `PUT`
* **Endpoint**: `/frames/:id`

#### Request Body
```json
{
  "code": "FS-05",
  "name": "12 × 18 inch",
  "width": 12,
  "height": 18,
  "unit": "inch",
  "category": "Large Gallery",
  "status": "Active"
}
```

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Frame size updated successfully.",
  "data": {
    "id": "f5",
    "code": "FS-05",
    "name": "12 × 18 inch",
    "width": 12,
    "height": 18,
    "unit": "inch",
    "category": "Large Gallery",
    "status": "Active"
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 7.4 Delete Frame Size
* **Method**: `DELETE`
* **Endpoint**: `/frames/:id`

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Frame size deleted successfully.",
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

## 8. Financial & Production Reports APIs

### 8.1 Financial Metrics & Summary
* **Method**: `GET`
* **Endpoint**: `/reports/financials`

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalBilled": 142500,
    "totalCollected": 98200,
    "totalOutstanding": 44300,
    "totalOrders": 42,
    "settlementStats": {
      "paidCount": 24,
      "paidPercentage": 57,
      "partialCount": 16,
      "partialPercentage": 38,
      "unpaidCount": 2,
      "unpaidPercentage": 5
    }
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 8.2 Production Moulding Breakdown
* **Method**: `GET`
* **Endpoint**: `/reports/production-breakdown`

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "type": "Wooden Frame",
      "count": 26,
      "percentage": 45
    },
    {
      "type": "Premium Frame",
      "count": 14,
      "percentage": 24
    },
    {
      "type": "Classic Frame",
      "count": 10,
      "percentage": 17
    },
    {
      "type": "Canvas Float",
      "count": 5,
      "percentage": 9
    },
    {
      "type": "Box Frame",
      "count": 3,
      "percentage": 5
    }
  ],
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 8.3 Export Financial Report (CSV Stream)
* **Method**: `GET`
* **Endpoint**: `/reports/export-csv`
* **Headers**: `Accept: text/csv`

#### Response (`200 OK` — `Content-Type: text/csv`)
```csv
Order Number,Customer Name,Phone,City,Order Date,Delivery Date,Total Amount,Advance Paid,Balance,Payment Status,Order Status
"RA-1006","Arun Kumar","+91 7902261255","Trivandrum","2026-09-02","2026-09-09",2500,1000,1500,"Partial","In Progress"
"RA-1001","Meera Nair","+91 9847123456","Kochi","2026-08-28","2026-09-05",4500,0,4500,"Unpaid","Cancelled"
"RA-1003","Rahul Raj","+91 9446554433","Kollam","2026-08-30","2026-09-02",12000,12000,0,"Paid","Completed"
```

---

## 9. Workshop & System Settings APIs

### 9.1 Get Workshop Settings
* **Method**: `GET`
* **Endpoint**: `/settings`

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "workshopName": "Raigon Arts",
    "subtitle": "Custom Photo Framing & Studio Workshop",
    "phone": "+91 7902261255",
    "whatsappPhone": "+91 7902261255",
    "address": "Workshop St, Art District, Trivandrum, Kerala 695001",
    "currency": "₹",
    "adminUsername": "admin",
    "taxRate": 5,
    "registeredPhone": "+91 7902261255"
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 9.2 Update Workshop Settings
* **Method**: `PUT`
* **Endpoint**: `/settings`

#### Request Body
```json
{
  "workshopName": "Raigon Arts Workshop",
  "subtitle": "Custom Frame Moulding & Gallery Framing",
  "phone": "+91 7902261255",
  "whatsappPhone": "+91 7902261255",
  "address": "Workshop St, Art District, Kowdiar, Trivandrum, Kerala 695003",
  "adminUsername": "admin",
  "registeredPhone": "+91 7902261255"
}
```

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Workshop settings saved successfully.",
  "data": {
    "workshopName": "Raigon Arts Workshop",
    "subtitle": "Custom Frame Moulding & Gallery Framing",
    "phone": "+91 7902261255",
    "whatsappPhone": "+91 7902261255",
    "address": "Workshop St, Art District, Kowdiar, Trivandrum, Kerala 695003",
    "adminUsername": "admin",
    "registeredPhone": "+91 7902261255"
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

## 10. Notifications APIs

### 10.1 List Notifications
* **Method**: `GET`
* **Endpoint**: `/notifications`

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "unreadCount": 2,
    "notifications": [
      {
        "id": "n1",
        "title": "New Order Received",
        "message": "Order #RA-1006 created for Arun Kumar",
        "time": "10m ago",
        "isRead": false,
        "type": "order"
      },
      {
        "id": "n2",
        "title": "Payment Updated",
        "message": "Advance paid ₹1000 for Order #RA-1006",
        "time": "1h ago",
        "isRead": false,
        "type": "order"
      },
      {
        "id": "n3",
        "title": "Customer Profile Created",
        "message": "Ananya Sreedhar added from Calicut",
        "time": "2h ago",
        "isRead": true,
        "type": "customer"
      }
    ]
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

### 10.2 Mark All Notifications as Read
* **Method**: `PATCH`
* **Endpoint**: `/notifications/mark-all-read`

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "All notifications marked as read.",
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

## 11. Data Backup & Restore APIs

### 11.1 Export Complete Database (JSON Backup)
* **Method**: `GET`
* **Endpoint**: `/backup/export`

#### Response Body (`200 OK` — `application/json`)
```json
{
  "backupVersion": "1.0",
  "exportedAt": "2026-09-03T11:00:00.000Z",
  "workshop": "Raigon Arts",
  "customers": [ /* Full array of Customer objects */ ],
  "orders": [ /* Full array of Order objects */ ],
  "frames": [ /* Full array of FrameSize objects */ ],
  "settings": { /* WorkshopSettings object */ }
}
```

---

### 11.2 Restore Database Backup
* **Method**: `POST`
* **Endpoint**: `/backup/restore`

#### Request Body
```json
{
  "backupVersion": "1.0",
  "customers": [ /* ... */ ],
  "orders": [ /* ... */ ],
  "frames": [ /* ... */ ],
  "settings": { /* ... */ }
}
```

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Database successfully restored from JSON backup.",
  "data": {
    "restoredCustomers": 4,
    "restoredOrders": 6,
    "restoredFrames": 7
  },
  "timestamp": "2026-09-03T11:00:00.000Z"
}
```

---

## 12. Global Error Codes & Response Schemas

| HTTP Status | Error Code | Description |
|---|---|---|
| `400` | `BAD_REQUEST` | Validation error on payload fields. |
| `400` | `INVALID_OTP` | The provided WhatsApp OTP code is incorrect or expired. |
| `401` | `UNAUTHORIZED` | Bearer token is missing, malformed, or expired. |
| `401` | `INVALID_CREDENTIALS` | Invalid username or password on `/auth/login`. |
| `403` | `FORBIDDEN` | Insufficient permissions for the requested operation. |
| `404` | `NOT_FOUND` | The specified entity ID (Customer, Order, Frame) does not exist. |
| `409` | `CONFLICT` | Resource already exists (e.g., duplicated phone or frame size code). |
| `500` | `INTERNAL_SERVER_ERROR` | Unhandled server exception occurred. |
