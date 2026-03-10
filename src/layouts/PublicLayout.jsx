import { Outlet } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function PublicLayout() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SINotarial
          </Typography>
          <Button color="inherit" component={RouterLink} to="/login">
            Iniciar Sesión
          </Button>
          <Button color="inherit" component={RouterLink} to="/register">
            Registrarse
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}
