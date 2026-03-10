import { Typography, Button, Grid, Card, CardContent } from "@mui/material";
import { Description, Security, Speed } from "@mui/icons-material";

export default function LandingPage() {
  return (
    <>
      <Typography variant="h2" align="center" gutterBottom>
        SINotarial
      </Typography>
      <Typography variant="h5" align="center" color="textSecondary" paragraph>
        Sistema Notarial Integrado - Gestión de trámites digitales
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Description sx={{ fontSize: 40, color: "primary.main" }} />
              <Typography variant="h6">Trámites Digitales</Typography>
              <Typography variant="body2" color="textSecondary">
                Inicia tus trámites notariales desde cualquier lugar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Security sx={{ fontSize: 40, color: "primary.main" }} />
              <Typography variant="h6">Firma Digital</Typography>
              <Typography variant="body2" color="textSecondary">
                Documentos con validez legal y máxima seguridad
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Speed sx={{ fontSize: 40, color: "primary.main" }} />
              <Typography variant="h6">Rápido y Eficiente</Typography>
              <Typography variant="body2" color="textSecondary">
                Reduce tiempos de espera y trámites presenciales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
