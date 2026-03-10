import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import {
  Description as PdfIcon,
  Image as ImageIcon,
  TextSnippet as TextIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

const getFileIcon = (tipo) => {
  switch (tipo) {
    case "pdf":
      return <PdfIcon color="error" />;
    case "image":
      return <ImageIcon color="primary" />;
    default:
      return <TextIcon color="action" />;
  }
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export default function DocumentList({
  documents,
  onDownload,
  onDelete,
  showActions = true,
}) {
  const { user } = useAuth();

  if (!documents || documents.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="textSecondary">
          No hay documentos adjuntos
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {documents.map((doc, index) => (
        <ListItem
          key={index}
          secondaryAction={
            showActions && (
              <Box>
                {doc.firmado && (
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Firmado"
                    color="success"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                )}
                <IconButton edge="end" onClick={() => onDownload(doc)}>
                  <DownloadIcon />
                </IconButton>
                {user?.rol === "admin" && (
                  <IconButton edge="end" onClick={() => onDelete(doc)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            )
          }
        >
          <ListItemIcon>{getFileIcon(doc.tipo)}</ListItemIcon>
          <ListItemText
            primary={doc.nombre}
            secondary={
              <>
                {formatFileSize(doc.tamaño)}
                {doc.fechaSubida &&
                  ` • Subido: ${new Date(doc.fechaSubida).toLocaleDateString()}`}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
