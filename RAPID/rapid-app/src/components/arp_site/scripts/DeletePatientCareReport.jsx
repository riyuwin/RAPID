import { firestore } from '../../../firebase/firebase';
import { deleteDoc, doc } from "firebase/firestore";
import Swal from 'sweetalert2';

async function DeletePatientCareReport(collectionName, documentId) {
    try {
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        // If user confirms, proceed to delete
        if (result.isConfirmed) {
            const docRef = doc(firestore, collectionName, documentId);

            // Delete the document
            await deleteDoc(docRef);

            // Show a success message
            await Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The report has been deleted successfully.',
                timer: 1500,
            });
        }
    } catch (error) {
        // Show an error message
        await Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Failed to delete the report: ${error.message}`,
        });
        console.error("Error deleting document: ", error);
    }
}

export default DeletePatientCareReport;
