import { MainLayout } from "@sloop-vite/MainLayout";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Home } from "./home.lazy";

export const Route = createLazyFileRoute('/')({
    component: () => <MainLayout><Home /></MainLayout>
})