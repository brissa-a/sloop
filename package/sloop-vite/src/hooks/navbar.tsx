import { useDisclosure } from "@mantine/hooks";
import React, { createContext } from "react";

type NavBarContextProps = ReturnType<typeof useDisclosure>;

export const NavBarContext = createContext<NavBarContextProps>([false, { open: () => { }, close: () => { }, toggle: () => { } }]);

export const useNavbar = () => {
    return React.useContext(NavBarContext);
}
