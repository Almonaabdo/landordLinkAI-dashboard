/*
* FILE        : Functions.js
* 
* Description : Contains related generic databse function that will be utilized from interface screens
* 
* Author      : Abdurrahman Almouna, Yafet Tekleab
* Date        : October 31, 2024
* Version     : 1.0
* 
*/

import { db } from './firebaseConfig';
import { collection, addDoc, getDoc, setDoc, getDocs, updateDoc, deleteDoc, doc, Timestamp, query, where } from 'firebase/firestore';

/*
* APARTMENT AND TENANT MANAGEMENT IMPLEMENTATION GUIDE
* 
* 1. DATABASE STRUCTURE
* 
* Apartments Collection:
* - apartmentId (auto-generated)
* - buildingName: string
* - unitNumber: string
* - floor: number
* - rooms: number
* - status: 'available' | 'occupied'
* - monthlyRent: number
* - amenities: string[]
* - maxOccupants: number
* - currentOccupants: number
* - createdAt: timestamp
* - updatedAt: timestamp
* 
* TenantApartments Collection:
* - id (auto-generated)
* - userId: string (reference to user)
* - apartmentId: string (reference to apartment)
* - status: 'active' | 'inactive' | 'pending'
* - role: 'primary' | 'secondary'
* - leaseStartDate: timestamp
* - leaseEndDate: timestamp
* - createdAt: timestamp
* - updatedAt: timestamp
* 
* Users Collection (Update):
* - Add apartmentId reference
* - Add leaseStartDate
* - Add leaseEndDate
* 
* 2. CORE FUNCTIONS TO IMPLEMENT
* 
* Apartment Management:
* - createApartment(apartmentData)
* - updateApartment(apartmentId, updateData)
* - deleteApartment(apartmentId)
* - getApartment(apartmentId)
* - getAllApartments()
* - getAvailableApartments()
* 
* Tenant Assignment:
* - assignTenant(userId, apartmentId, leaseData)
* - removeTenant(userId, apartmentId)
* - getApartmentTenants(apartmentId)
* - getTenantApartment(userId)
* - updateTenantRole(userId, apartmentId, newRole)
* 
* Lease Management:
* - createLease(tenantApartmentId, leaseData)
* - updateLease(tenantApartmentId, updateData)
* - endLease(tenantApartmentId)
* - getLeaseDetails(tenantApartmentId)
* 
* 3. VALIDATION RULES
* 
* Apartment Validation:
* - Check if apartment exists
* - Validate apartment status
* - Check occupant limits
* - Validate required fields
* 
* Tenant Validation:
* - Check if user exists
* - Validate user role
* - Check if user already has active lease
* - Validate lease dates
* 
* 4. ERROR HANDLING
* 
* Common Errors:
* - Apartment not found
* - User not found
* - Apartment full
* - Invalid lease dates
* - User already assigned
* - Permission denied
* 
* 5. SECURITY RULES
* 
* Access Control:
* - Only landlords/admins can create apartments
* - Only landlords/admins can assign tenants
* - Tenants can only view their own apartment
* - Validate user roles for all operations
* 
* 6. QUERY EXAMPLES
* 
* Common Queries:
* - Get all apartments for a building
* - Get all tenants in an apartment
* - Get all available apartments
* - Get tenant's current apartment
* - Get apartment's rental history
* 
* 7. UI COMPONENTS NEEDED
* 
* Screens:
* - ApartmentListScreen
* - ApartmentDetailScreen
* - TenantAssignmentScreen
* - LeaseManagementScreen
* 
* Components:
* - ApartmentCard
* - TenantList
* - LeaseForm
* - AssignmentForm
* 
* 8. TESTING REQUIREMENTS
* 
* Test Cases:
* - Apartment creation/update
* - Tenant assignment/removal
* - Lease creation/update
* - Permission checks
* - Error handling
* - Edge cases
* 
* 9. IMPLEMENTATION ORDER
* 
* Phase 1:
* - Database structure setup
* - Basic CRUD operations
* - Simple tenant assignment
* 
* Phase 2:
* - Multiple tenant support
* - Lease management
* - Advanced queries
* 
* Phase 3:
* - UI implementation
* - Security rules
* - Testing
* 
* Phase 4:
* - Error handling
* - Edge cases
* - Documentation
*/

// Create Apartments table
// export const createApartment = async (apartment) => {
//   try {
//     // Check if the ID is valid (4 characters long, alphanumeric)
//     const idRegex = /^[A-Za-z0-9]{4}$/;
//     if (!idRegex.test(apartment.id)) {
//       console.error("Invalid ID format. It must be 4 characters long and alphanumeric.");
//       return;
//     }

//     // Ensure values are valid
//     if (apartment.floor <= 0 || apartment.rooms <= 0 || apartment.est <= 0) {
//       console.error("FLOOR, ROOMS, and EST must be greater than 0.");
//       return;
//     }

//     // Create or update the apartment document in the collection
//     await setDoc(doc(db, "apartments", apartment.id), {
//       floor: apartment.floor,
//       rooms: apartment.rooms,
//       occupied: apartment.occupied,
//       est: apartment.est,
//       userId: apartment.userId

//     });

//   } catch (e) {
//     console.error("Error adding apartment: ", e);
//   }
// };

// Add data
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.fromDate(new Date()), // Store as Firestore Timestamp
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// Fetch data
export const fetchDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(), // Convert Firestore Timestamp to JS Date
        createdBy: data.createdBy || null, // Ensure createdBy is included
      };
    });
    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

// Fetch data by ID
export const fetchDocumentByID = async (docRef) => {
  try {
    if (!docRef) {
      throw new Error('Document reference is required');
    }

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    return docSnap.data();
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error; // Re-throw the error so callers can handle it
  }
};


// Update data
export const updateDocument = async (collectionName, id, data) => {
  const docRef = doc(db, collectionName, id);
  try {
    await updateDoc(docRef, data);
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
};

// Delete data
export const deleteDocument = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};

// Update Status
export const updateStatus = async (requestId, newStatus) => {
  try {
    const requestRef = doc(db, 'repairRequests', requestId);
    await updateDoc(requestRef, {
      status: newStatus,
    });
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

// Apartment Management Functions

// Create a new apartment
export const createApartment = async (apartmentData) => {
  try {
    // Validate required fields
    if (!apartmentData.unitNumber || !apartmentData.rooms ||
      !apartmentData.monthlyRent || !apartmentData.maxOccupants) {
      throw new Error('Missing required fields: unitNumber, rooms, monthlyRent, maxOccupants');
    }

    // Validate numeric fields
    if (typeof apartmentData.rooms !== 'number' || apartmentData.rooms <= 0 ||
      typeof apartmentData.monthlyRent !== 'number' || apartmentData.monthlyRent <= 0 ||
      typeof apartmentData.maxOccupants !== 'number' || apartmentData.maxOccupants <= 0) {
      throw new Error('Invalid numeric values: rooms, monthlyRent, and maxOccupants must be positive numbers');
    }

    // Check if apartment with same unit number exists
    const apartmentsRef = collection(db, 'apartments');
    const querySnapshot = await getDocs(apartmentsRef);
    const existingApartment = querySnapshot.docs.find(doc =>
      doc.data().unitNumber === apartmentData.unitNumber
    );

    if (existingApartment) {
      throw new Error('Apartment with this unit number already exists');
    }

    // Create apartment document with initial status
    const newApartment = {
      ...apartmentData,
      status: 'available',
      currentOccupants: 0,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    const docRef = await addDoc(collection(db, 'apartments'), newApartment);
    return { id: docRef.id, ...newApartment };
  } catch (error) {
    console.error('Error creating apartment:', error);
    throw error;
  }
};

// Update apartment details
export const updateApartment = async (apartmentId, updateData) => {
  try {
    // Validate apartment exists
    const apartmentRef = doc(db, 'apartments', apartmentId);
    const apartmentDoc = await getDoc(apartmentRef);

    if (!apartmentDoc.exists()) {
      throw new Error('Apartment not found');
    }

    // Validate numeric fields if they are being updated
    if (updateData.floor && (typeof updateData.floor !== 'number' || updateData.floor <= 0)) {
      throw new Error('Invalid floor number');
    }
    if (updateData.rooms && (typeof updateData.rooms !== 'number' || updateData.rooms <= 0)) {
      throw new Error('Invalid number of rooms');
    }
    if (updateData.monthlyRent && (typeof updateData.monthlyRent !== 'number' || updateData.monthlyRent <= 0)) {
      throw new Error('Invalid monthly rent');
    }
    if (updateData.maxOccupants && (typeof updateData.maxOccupants !== 'number' || updateData.maxOccupants <= 0)) {
      throw new Error('Invalid maximum occupants');
    }

    // Check if unit number is being changed and if it already exists
    if (updateData.unitNumber) {
      const apartmentsRef = collection(db, 'apartments');
      const querySnapshot = await getDocs(apartmentsRef);
      const existingApartment = querySnapshot.docs.find(doc =>
        doc.id !== apartmentId &&
        doc.data().unitNumber === updateData.unitNumber
      );

      if (existingApartment) {
        throw new Error('Apartment with this unit number already exists');
      }
    }

    // Update apartment document
    const updatedData = {
      ...updateData,
      updatedAt: Timestamp.fromDate(new Date())
    };

    await updateDoc(apartmentRef, updatedData);
    return { id: apartmentId, ...updatedData };
  } catch (error) {
    console.error('Error updating apartment:', error);
    throw error;
  }
};

// Delete an apartment
export const deleteApartment = async (apartmentId) => {
  try {
    // Check if apartment exists
    const apartmentRef = doc(db, 'apartments', apartmentId);
    const apartmentDoc = await getDoc(apartmentRef);

    if (!apartmentDoc.exists()) { 
      throw new Error('Apartment not found');
    }

    // Check if apartment has active tenants
    const tenantApartmentsRef = collection(db, 'tenantApartments');
    const querySnapshot = await getDocs(tenantApartmentsRef);
    const activeTenants = querySnapshot.docs.filter(doc =>
      doc.data().apartmentId === apartmentId &&
      doc.data().status === 'active'
    );

    if (activeTenants.length > 0) { // Check if apartment has active tenants
      throw new Error('Cannot delete apartment with active tenants');
    }

    // Delete apartment document
    await deleteDoc(apartmentRef);
    return { success: true, message: 'Apartment deleted successfully' };
  } catch (error) {
    console.error('Error deleting apartment:', error);
    throw error;
  }
};

// Get all apartments
export const getAllApartments = async () => {
  try {
    const apartmentsRef = collection(db, 'apartments'); // Get all apartments   
    const querySnapshot = await getDocs(apartmentsRef); // Execute the query
    const apartments = querySnapshot.docs.map(doc => ({ // Map through all apartment documents
      id: doc.id,
      ...doc.data()
    }));
    return apartments; // Return the apartments
  } catch (error) {
    console.error('Error fetching apartments:', error);
    throw error;
  }
};

// Get available apartments
export const getAvailableApartments = async () => {
  try {
    const apartmentsRef = collection(db, 'apartments'); // Get all apartments
    const q = query(apartmentsRef, where('currentOccupants', '<', 3)); // Query to get all available apartments
    const querySnapshot = await getDocs(q); // Execute the query
    const apartments = querySnapshot.docs.map(doc => ({ // Map through all apartment documents
      id: doc.id,
      ...doc.data()
    }));
    return apartments; // Return the available apartments
  } catch (error) {
    console.error('Error fetching available apartments:', error);
    throw error;
  }
};

// Tenant Assignment Functions

// Assign tenant to apartment
export const assignTenant = async (userId, apartmentId, leaseData) => {
  try {
    // Check if apartment exists
    const apartmentRef = doc(db, 'apartments', apartmentId);
    const apartmentDoc = await getDoc(apartmentRef);

    if (!apartmentDoc.exists()) {
      throw new Error('Apartment not found');
    }

    const apartment = apartmentDoc.data(); // Get the apartment data

    // Check if apartment has less than 3 occupants
    if (apartment.currentOccupants >= 3) {
      throw new Error('Apartment is at maximum capacity (3 occupants)');
    }

    // Check if user exists
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    // Check if user already has an active apartment
    const tenantApartmentsRef = collection(db, 'tenantApartments'); // Get all tenant apartments
    const userQuery = query(tenantApartmentsRef, // Query to get all active tenants in an apartment
      where('userId', '==', userId), // Filter by user ID
      where('status', '==', 'active') // Filter by active status
    );
    const userSnapshot = await getDocs(userQuery); // Execute the query

    if (!userSnapshot.empty) {
      throw new Error('User already has an active apartment');
    }

    // Create tenant-apartment relationship
    const tenantApartmentData = {
      userId,
      apartmentId,
      status: 'active',
      role: 'primary',
      leaseStartDate: Timestamp.fromDate(new Date(leaseData.startDate)),
      leaseEndDate: Timestamp.fromDate(new Date(leaseData.endDate)),
      monthlyRent: apartment.monthlyRent,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    const tenantApartmentRef = await addDoc(collection(db, 'tenantApartments'), tenantApartmentData); // Create the tenant-apartment relationship

    // Update apartment occupant count
    await updateDoc(apartmentRef, {
      currentOccupants: apartment.currentOccupants + 1,
      updatedAt: Timestamp.fromDate(new Date())
    });

    // Update user's apartment reference
    await updateDoc(userRef, {
      apartmentId,
      updatedAt: Timestamp.fromDate(new Date())
    });

    return { // Return the tenant-apartment relationship
      id: tenantApartmentRef.id,
      ...tenantApartmentData
    };
  } catch (error) {
    console.error('Error assigning tenant:', error);
    throw error;
  }
};

// Remove tenant from apartment
async function removeTenant(userId, apartmentId) {
  // 1. Update tenant-apartment status to inactive
  // 2. Update apartment occupant count
  // 3. Remove user's apartment reference
}

// Get all tenants in an apartment
export const getApartmentTenants = async (apartmentId) => {
  try {
    const tenantApartmentsRef = collection(db, 'tenantApartments'); // Get all tenant apartments
    const q = query(tenantApartmentsRef, // Query to get all active tenants in an apartment
      where('apartmentId', '==', apartmentId), // Filter by apartment ID
      where('status', '==', 'active') // Filter by active status
    );
    const querySnapshot = await getDocs(q); // Execute the query

    const tenants = await Promise.all(querySnapshot.docs.map(async (doc) => { // Map through all tenant documents
      const tenantData = doc.data(); // Get the tenant data
      const userRef = doc(db, 'users', tenantData.userId); // Get the user reference
      const userDoc = await getDoc(userRef); // Get the user document
      return { // Return the tenant data
        id: doc.id,
        ...tenantData,
        user: userDoc.exists() ? userDoc.data() : null
      };
    }));

    return tenants;
  } catch (error) {
    console.error('Error fetching apartment tenants:', error);
    throw error;
  }
};

// Get tenant's current apartment
async function getTenantApartment(userId) {
  // 1. Query active tenant-apartment relationship
  // 2. Fetch apartment details
  // 3. Include lease information
  // 4. Return apartment object with lease details
}

// Update tenant role in apartment
async function updateTenantRole(userId, apartmentId, newRole) {
  // 1. Validate role change is allowed
  // 2. Update tenant-apartment relationship
  // 3. Update updatedAt timestamp
  // 4. Return success status
}

// Lease Management Functions

// Create lease agreement
async function createLease(tenantApartmentId, leaseData) {
  // 1. Validate lease data
  // 2. Check for date conflicts
  // 3. Create lease document
  // 4. Update tenant-apartment relationship
  // 5. Return lease ID
}

// Update lease details
async function updateLease(tenantApartmentId, updateData) {
  // 1. Validate lease exists
  // 2. Validate update data
  // 3. Update lease document
  // 4. Update updatedAt timestamp
  // 5. Return success status
}

// End lease agreement
async function endLease(tenantApartmentId) {
  // 1. Update lease status to 'ended'
  // 2. Update tenant-apartment status
  // 3. Update apartment status if needed
  // 4. Return success status
}

// Get lease details
async function getLeaseDetails(tenantApartmentId) {
  // 1. Fetch lease document
  // 2. Include tenant and apartment details
  // 3. Include payment history
  // 4. Return lease object with all details
}

// UI Implementation Steps

// ApartmentListScreen.js
/*
1. Create screen component
2. Implement apartment list view
   - Use FlatList for performance
   - Add pull-to-refresh
   - Add search functionality
3. Add apartment card component
   - Show basic apartment info
   - Show status badge
   - Add action buttons
4. Add filters
   - Filter by status
   - Filter by building
   - Filter by price range
5. Add sorting options
   - Sort by price
   - Sort by unit number
   - Sort by status
*/

// ApartmentDetailScreen.js
/*
1. Create screen component
2. Show apartment details
   - Basic information
   - Amenities
   - Current tenants
   - Lease information
3. Add edit functionality
   - Update apartment details
   - Add/remove amenities
4. Add tenant management
   - View current tenants
   - Add new tenants
   - Remove tenants
5. Add lease management
   - View current lease
   - Create new lease
   - End existing lease
*/

// TenantAssignmentScreen.js
/*
1. Create screen component
2. Add tenant search/selection
   - Search by name
   - Search by email
   - Show user details
3. Add apartment selection
   - Show available apartments
   - Filter by criteria
4. Add lease form
   - Start date
   - End date
   - Rent amount
   - Terms and conditions
5. Add validation
   - Check apartment availability
   - Check tenant eligibility
   - Validate lease dates
*/

// Security Rules Implementation
/*
1. Firestore Rules
   - Apartments collection
     - Read: authenticated users
     - Create: landlords and admins
     - Update: landlords and admins
     - Delete: admins only
   - TenantApartments collection
     - Read: authenticated users
     - Create: landlords and admins
     - Update: landlords and admins
     - Delete: admins only
   - Users collection
     - Read: self and admins
     - Update: self and admins
     - Delete: admins only

2. Role-based Access Control
   - Implement role checking middleware
   - Add role validation to all operations
   - Handle unauthorized access errors
*/

// Get all users
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
