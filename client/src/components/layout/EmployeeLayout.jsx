import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Container from '../ui/Container';

const EmployeeLayout = () => {
    return (
        <div className="min-h-screen bg-brand-gray-light">
            <Sidebar />

            <div className="ml-64 transition-all duration-300">
                <Header />

                <main className="p-4 sm:p-8 animate-in fade-in">
                    <Container>
                        <Outlet />
                    </Container>
                </main>
            </div>
        </div>
    );
};

export default EmployeeLayout;
