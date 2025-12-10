import { useState } from "react";
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

const ClientKeys = () => {
    const [t] = useTranslation();

    const [passport, setPassport] = useState("");
    const [keys, setKeys] = useState([]);
    const [error, setError] = useState("");

    const fetchKeys = async () => {
        setError("");
        setKeys([]);

        if (!passport.trim()) {
            setError(t("notifications.pleaseEnterID"));
            return;
        }

        try {
            const response = await authFetch(
                `http://localhost:8080/api/v0/artifact/keys`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        passportID: passport.trim(),
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (!response.ok) throw new Error(t("notifications.pleaseEnterID"));

            const data = await response.json();
            if (!data.length) {
                setError(t("notifications.pleaseEnter.keysNotFound"));
                return;
            }
            setKeys(data);
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
                    {t('artifactMain.searchKey.title')}
                </Typography>

                <TextField
                    label={t('artifactMain.searchKey.ID')}
                    value={passport}
                    onChange={(e) => setPassport(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                <Button variant="contained" onClick={fetchKeys} sx={{ mt: 2 }}>
                    {t('artifactMain.searchKey.search')}
                </Button>

                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}

                {keys.length > 0 && (
                    <TableContainer component={Paper} sx={{ mt: 3, bgcolor: "background.paper", borderRadius: 1 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('artifactMain.searchKey.table.artifact')}</TableCell>
                                    <TableCell>{t('artifactMain.searchKey.table.UUID')}</TableCell>
                                    <TableCell>{t('artifactMain.searchKey.table.lvlDangerous')}</TableCell>
                                    <TableCell>{t('artifactMain.searchKey.table.gave')}</TableCell>
                                    <TableCell>{t('artifactMain.searchKey.table.expired')}</TableCell>
                                    <TableCell>{t('artifactMain.searchKey.table.keyValue')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {keys.map((key) => {
                                    const artifact = key.artifactStorage?.artifact;
                                    return (
                                        <TableRow key={key.uuid}>
                                            <TableCell>{artifact?.name?.replace(/_/g, " ") || "Неизвестно"}</TableCell>
                                            <TableCell>{key.artifactStorage?.uuid || "Неизвестно"}</TableCell>
                                            <TableCell>{artifact?.magicalProperty?.dangerLevel || "Не указан"}</TableCell>
                                            <TableCell>{new Date(key.issuedAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(key.expiresAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{key.jwtToken}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default ClientKeys;