import { Button, Checkbox, Group, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { LoginSchema } from '@sloop-common/sloop_zod/user';
import { zodResolver } from 'mantine-form-zod-resolver';
import z from 'zod';

export type LoginModel = z.infer<typeof LoginSchema>

type Form = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>

type LoginFormProps = Form & {
    onLogin: (meeting: LoginModel) => void,
    startingValues: Partial<LoginModel>
}

export const LoginForm = (props: LoginFormProps) => {
    const initialValues = Object.assign({}, props.startingValues);
    const form = useForm({
        initialValues,
        validate: zodResolver(LoginSchema),
    });

    const inputs: Record<keyof LoginModel, JSX.Element> = {
        id: <TextInput {...form.getInputProps('id')} placeholder="Votre email ou nom d'utilisateur" />,
        password: <PasswordInput {...form.getInputProps('password')} />,
        keepMeLoggedIn: <Checkbox label="Rester connecter" {...form.getInputProps('keepMeLoggedIn')} />,
        forwardAdmin: <Checkbox type="hidden" checked={false} placeholder='Mot de passe' />,
    };

    Object.keys(form.errors).length && console.log(form.errors)
    return <Stack mx="auto">
        <form onSubmit={e => {
            form.onSubmit((values) => {
                const validated = LoginSchema.parse(values);
                props.onLogin(validated);
            })(e)
        }}>
            <Stack gap="md" w={320}>
                {inputs.id}
                {inputs.password}
                {inputs.keepMeLoggedIn}
            </Stack>
            <Group justify='center'><Button type="submit" mt={15} >Login</Button></Group>
        </form>
    </Stack>
};
