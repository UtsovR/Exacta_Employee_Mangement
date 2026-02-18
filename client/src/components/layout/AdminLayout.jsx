import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Container from '../ui/Container';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-brand-gray-light overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
                <Header />

                <main className="flex-1 overflow-y-auto p-8 animate-in fade-in">
                    <Container>
                        <Outlet />
                    </Container>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
