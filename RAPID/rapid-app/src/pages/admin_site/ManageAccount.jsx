
import ManageAccountsContent from "../../components/admin_site/ManageAccountsContent";
import NavBar from "../../components/admin_site/NavBar";
import Sidebar from "../../components/admin_site/Sidebar";


function ManageAccount() {

    return (
        <>
            <NavBar />
            <Sidebar />
            <ManageAccountsContent />
        </>
    );

}

export default ManageAccount;