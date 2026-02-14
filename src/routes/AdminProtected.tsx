import type { AppState } from "@/store"
import type { ReactNode } from "react"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";

function AdminProtected({ children }: {children: ReactNode}) {
    const { user } = useSelector((state: AppState) => state.user);

    if (!user) {
        return <Navigate to={"/login"} replace={true} />
    } if (user && user.role === 0) {
        return <Navigate to={"/"} replace={true} />
    } else {
        return children;
    }
}

export default AdminProtected