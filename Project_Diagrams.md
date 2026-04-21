# SkillNear Database & Architecture Documentation

This document provides a comprehensive technical breakdown of the SkillNear data layer.

## 1. Relational Database Schema (Logical)

The following diagram uses a structured schema notation to show primary keys (PK), foreign keys (FK), and attribute data types. This is optimized for a physical database implementation in MongoDB.

```mermaid
classDiagram
    class User {
        +ObjectId _id PK
        +String name
        +String username [Unique]
        +String email [Unique]
        +String password [Hashed]
        +Enum role ["customer", "provider", "admin"]
        +String phone
        +Object address
        +GeoPoint geoCoordinates
        +Object providerDetails
        +Date createdAt
    }

    class Service {
        +ObjectId _id PK
        +ObjectId providerID FK [ref: User]
        +String title
        +String category
        +Enum businessType ["service", "shop"]
        +Number price
        +Plan[] plans
        +Object shopDetails
        +GeoPoint geoCoordinates
        +Boolean isApproved
    }

    class Booking {
        +ObjectId _id PK
        +ObjectId customerID FK [ref: User]
        +ObjectId serviceID FK [ref: Service]
        +ObjectId providerID FK [ref: User]
        +Date date
        +String timeSlot
        +Number totalPrice
        +Enum status ["pending", "confirmed", "completed", etc]
        +Enum paymentStatus ["pending", "paid", "failed"]
    }

    class Review {
        +ObjectId _id PK
        +ObjectId reviewerID FK [ref: User]
        +ObjectId serviceID FK [ref: Service]
        +ObjectId providerID FK [ref: User]
        +Number rating [1-5]
        +String comment
    }

    class Message {
        +ObjectId _id PK
        +ObjectId senderID FK [ref: User]
        +ObjectId receiverID FK [ref: User]
        +String roomId
        +String message
        +Boolean read
    }

    User "1" --> "0..*" Service : manages
    User "1" --> "0..*" Booking : places
    Service "1" --> "0..*" Booking : is booked
    User "1" --> "0..*" Review : writes
    Service "1" --> "0..*" Review : receives
    User "1" --> "0..*" Message : sends/receives
```

## 2. Technical ER Diagram (Visual Schema)

*This visualization mimics a professional database design tool, showing the precise links between tables and attribute lists.*

![Full Database Schema Visualization](file:///d:/My%20Project/skillnear/client/public/images/database_schema_v2.png)

## 3. Data Dictionary

### User Table (Collection: `users`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `role` | String | Defines permissions (admin access, provider dashboard visibility). |
| `geoCoordinates` | Object | Used for `$near` and `$geoWithin` queries (GeoJSON format). |

### Service Table (Collection: `services`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `provider` | ObjectId | Reference to the `User` who owns this service. |
| `plans` | Array | Nested objects containing Basic, Standard, and Premium tiers. |
| `isApproved` | Boolean | Visibility flag controlled by admin moderation. |

### Booking Table (Collection: `bookings`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `status` | String | Tracks the state machine: `pending` -> `confirmed` -> `completed`. |
| `paymentStatus` | String | Integrated with the checkout workflow. |

---

## 4. Connectivity & Cardinality
- **User to Service (1:N)**: A provider can host multiple services (e.g., a tutor offering Math and Science).
- **Service to Booking (1:N)**: A single service listing can have hundreds of historical and active bookings.
- **User to Booking (1:N)**: A customer registers multiple bookings across different service categories.
- **Message Room (N:M)**: Users are linked via unique `roomId` strings in the chat system.
