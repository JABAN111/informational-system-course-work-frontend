import {useState} from "react";
import {
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import authFetch from "../../../hooks/authFetch.jsx";
import '../../../i18n.js'
import {useTranslation} from "react-i18next";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#64b5f6",
        },
        background: {
            default: "#212121",
            paper: "#424242",
        },
    },
});

const ArtifactStorageInfo = () => {
    const [ t ] = useTranslation();

    const [uuid, setUuid] = useState("");
    const [storage, setStorage] = useState(null);
    const [error, setError] = useState("");

    const fetchStorageInfo = async () => {
        setError("");
        setStorage(null);

        if (!uuid.trim()) {
            setError("Введите UUID хранилища.");
            return;
        }

        try {
            const response = await authFetch(
                `http://localhost:8080/api/v0/storage/${uuid}`,
                { method: "GET" }
            );


            if (!response.ok) throw new Error("Ячейка не найдена.");

            const data = await response.json();
            setStorage(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    maxWidth: 600,
                    margin: "0 auto",
                    padding: 3,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                }}
            >
                <Typography variant="h5" gutterBottom>
                    {t('artifactMain.storageInfo.title')}
                </Typography>

                <TextField
                    label={t('artifactMain.storageInfo.UUID')}
                    value={uuid}
                    onChange={(e) => setUuid(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                <Button variant="contained" onClick={fetchStorageInfo} sx={{ mt: 2 }}>
                    {t('artifactMain.storageInfo.getInfo')}
                </Button>

                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}

                {storage && (
                    <TableContainer component={Paper} sx={{ mt: 3, bgcolor: "background.paper", borderRadius: 1 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('artifactMain.storageInfo.table.UUID')}</TableCell>
                                    <TableCell>{t('artifactMain.storageInfo.table.artifact')}</TableCell>
                                    <TableCell>{t('artifactMain.storageInfo.table.dangerous')}</TableCell>
                                    <TableCell>{t('artifactMain.storageInfo.table.currentClient')}</TableCell>
                                    <TableCell>{t('artifactMain.storageInfo.table.creationDate')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{storage.uuid}</TableCell>
                                    <TableCell>{storage.artifact.name.replace(/_/g, " ")}</TableCell>
                                    <TableCell>{storage.artifact.magicalProperty.dangerLevel}</TableCell>
                                    <TableCell>{storage.artifact.currentClient?.passportID || "Нет владельца"}</TableCell>
                                    <TableCell>{new Date(storage.artifact.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default ArtifactStorageInfo;