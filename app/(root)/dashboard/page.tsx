'use client';

import styles from './page.module.css';
import { InventoryIcon, OrderIcon, SalesIcon } from '@/app/components/svg';
import OptionCard from '@/app/components/dashboard/optioncard/OptionCard';
import Topbar from '@/app/components/dashboard/topbar/Topbar';

const options = [
    {
        className: 'sales',
        title: 'Ventas',
        hook: '¡El éxito te espera!',
        subtitle: 'Consulta tus resultados y estrategias.',
        icon: <SalesIcon />,
        link: '/sales',
    },
    {
        className: 'order',
        title: 'Pedidos',
        hook: '¡Clientes felices!',
        subtitle: 'Gestiona tus reservas y clientes.',
        icon: <OrderIcon />,
        link: '/order',
    },
    {
        className: 'inventory',
        title: 'Inventario',
        hook: '¡Control total!',
        subtitle: 'Cierra operaciones y actualiza tu stock.',
        icon: <InventoryIcon />,
        link: '/inventory',
    },
];

const Dashboard = ()  =>
{
    return (
        <div className={styles.dashboard}>
            <Topbar />
            <div className={styles.options}>
                {options.map((option, index) => (
                    <OptionCard
                        key={index}
                        className={option.className}
                        title={option.title}
                        hook={option.hook}
                        subtitle={option.subtitle}
                        icon={option.icon}
                        link={option.link}
                    />
                ))}
            </div>
        </div>
    );
}

export default Dashboard;