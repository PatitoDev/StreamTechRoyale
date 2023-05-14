import { Flex } from '@mantine/core';
import { NavLink } from 'react-router-dom';

const NavLinkCss: React.CSSProperties = {
    textDecoration: 'none',
    color: '#272727',
};

const NavBar = () => {

    return (
        <Flex p="2em" gap="lg" align="center" justify="flex-end">
            <NavLink style={NavLinkCss} to='/' >Home</NavLink>
            <NavLink style={NavLinkCss} to='/history' >History</NavLink>
        </Flex>
    );
};

export default NavBar;