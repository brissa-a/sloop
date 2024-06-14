import { Popover } from "@mantine/core";
import { useSloop } from "@sloop-vite/hooks/sloop";
import { ReactNode } from "@tanstack/react-router";
import { LoginForm, LoginModel } from "./LoginForm";

type DelegateActionProps = {
    startingValues: Partial<LoginModel>
    button: (props: { onClick: () => void, disabled: boolean }) => ReactNode
}

export const LoginAction = ({ startingValues, button }: DelegateActionProps) => {
    const { login } = useSloop();

    return <>
        <Popover trapFocus>
            <Popover.Target>
                {button({
                    onClick: open,
                    disabled: false,
                })}
            </Popover.Target>
            <Popover.Dropdown>
                <LoginForm onLogin={login} startingValues={startingValues} />
            </Popover.Dropdown>
        </Popover>
    </>;
};

