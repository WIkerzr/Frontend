import { ColorSchemeScript, MantineProvider } from '@mantine/core';

import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';
import './layout.css';

export default function TableMantineProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ColorSchemeScript defaultColorScheme="auto" />
            <MantineProvider defaultColorScheme="auto">{children}</MantineProvider>
        </>
    );
}
