import {useState} from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormLabel,
    InputLabel,
    MenuItem,
    Modal,
    Select, Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import authFetch from "../../../hooks/authFetch.jsx";
import {GET_DEPOSITS} from "../../../config.js";
import {useTranslation} from "react-i18next";
import '../../../i18n.js'

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

const ExportConfigModal = ({open, onClose, onSubmit}) => {

    const { t } = useTranslation(); // Подключаем переводы

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const showNotification = (message, severity = 'success') => {
        setNotification({open: true, message, severity});
    };
    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification((prev) => ({...prev, open: false}));
    };


    const [passport, setPassport] = useState("");
    const [exportFormat, setExportFormat] = useState("xlsx");
    const [operations, setOperations] = useState({
        deposits: false,
        withdrawals: false,
        transfers: false,
    });
    const [excludedCurrencies, setExcludedCurrencies] = useState({
        galeons: false,
        rubalions: false,
        euralions: false,
    });
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [passportSent, setPassportSent] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState("");

    const isReadyToSubmit = passportSent && selectedAccount;

    const handlePassportChange = (event) => {
        setPassport(event.target.value);
        setPassportSent(false);
    };

    const handleSendPassport = () => {
        if (!passport) {
            console.error("Пожалуйста, введите паспортные данные.");
            return;
        }

        setLoading(true);

        authFetch(`${GET_DEPOSITS}?passport=${encodeURIComponent(passport)}`, {method: "GET"})
            .then((response) => response.json())
            .then((data) => {
                setAccounts(data);
                setPassportSent(true);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Невалидный паспорт, ошибка:", error);
                alert("Невалидный паспорт");
                setLoading(false);
            });
    };

    const handleAccountChange = (event) => setSelectedAccount(event.target.value);

    const handleOperationChange = (event) =>
        setOperations({...operations, [event.target.name]: event.target.checked});

    const handleCurrencyChange = (event) =>
        setExcludedCurrencies({
            ...excludedCurrencies,
            [event.target.name]: event.target.checked,
        });

    const handleSubmit = () => {
        const payload = {
            passport,
            account: selectedAccount,
            exportFormat,
            operations: Object.keys(operations).filter((key) => operations[key]),
            excludedCurrencies: Object.keys(excludedCurrencies).filter(
                (key) => excludedCurrencies[key]
            ),
        };
        onSubmit(payload);
        onClose();
    };

    const downloadXlsxReport = () => {
        const payload = {
            passport,
            account: selectedAccount,
            exportFormat: "xlsx",
            operations: Object.keys(operations).filter((key) => operations[key]),
        };

        const queryParams = new URLSearchParams();
        queryParams.append("accountId", selectedAccount);

        // Правильное добавление параметров types
        payload.operations.forEach((operation) => {
            queryParams.append("types", operation);
        });

        setLoading(true);

        authFetch(`http://localhost:8080/api/v0/export/deposit/xlsx?${queryParams.toString()}`, {
            method: "GET",
        })
            .then((response) => {
                if (response.ok) {
                    return response.blob();
                } else {
                    throw new Error("Ошибка при скачивании файла.");
                }
            })
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "deposit_report.xlsx";
                a.click();
                window.URL.revokeObjectURL(url);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Ошибка при скачивании отчета:", error);
                alert("Ошибка при скачивании отчета");
                setLoading(false);
            });
    }
    const downloadPdfReport = () => {
        const payload = {
            passport,
            account: selectedAccount,
            exportFormat: "pdf",
            operations: Object.keys(operations).filter((key) => operations[key]),
        };

        const queryParams = new URLSearchParams();
        queryParams.append("accountId", selectedAccount);

        // Правильное добавление параметров types
        payload.operations.forEach((operation) => {
            queryParams.append("types", operation);
        });

        setLoading(true);

        authFetch(`http://localhost:8080/api/v0/export/deposit/pdf?${queryParams.toString()}`, {
            method: "GET",
        })
            .then((response) => {
                if (response.ok) {
                    return response.blob();
                } else {
                    throw new Error("Ошибка при скачивании файла.");
                }
            })
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "deposit_report.pdf";
                a.click();
                window.URL.revokeObjectURL(url);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Ошибка при скачивании отчета:", error);
                alert("Ошибка при скачивании отчета");
                setLoading(false);
            });
    }

    const downloadCsvReport = () => {
        const payload = {
            passport,
            account: selectedAccount,
            exportFormat: "csv",
            operations: Object.keys(operations).filter((key) => operations[key]),
        };

        const queryParams = new URLSearchParams();
        queryParams.append("accountId", selectedAccount);

        // Правильное добавление параметров types
        payload.operations.forEach((operation) => {
            queryParams.append("types", operation);
        });

        setLoading(true);

        authFetch(`http://localhost:8080/api/v0/export/deposit/csv?${queryParams.toString()}`, {
            method: "GET",
        })
            .then((response) => {
                if (response.ok) {
                    return response.blob();
                } else {
                    throw new Error("Ошибка при скачивании файла.");
                }
            })
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "deposit_report.csv";
                a.click();
                window.URL.revokeObjectURL(url);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Ошибка при скачивании отчета:", error);
                alert("Ошибка при скачивании отчета");
                setLoading(false);
            });
    };

    const processDownload = () => {
        switch (exportFormat) {
            case "xlsx":
                downloadXlsxReport()
                break
            case "pdf":
                downloadPdfReport()
                break
            case "csv":
                downloadCsvReport()
                break
            default:
                downloadXlsxReport()
                break
        }

    }
    return (
        <ThemeProvider theme={theme}>
            <Modal open={open} onClose={onClose}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        maxWidth: 500,
                        width: "100%",
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        {t('export.depositExport.exportConfiguration')}
                    </Typography>

                    <TextField
                        id="passport"
                        label={t('export.depositExport.accountId')}
                        variant="outlined"
                        fullWidth
                        value={passport}
                        onChange={handlePassportChange}
                        sx={{mb: 2}}
                    />

                    <Button
                        variant="contained"
                        onClick={handleSendPassport}
                        disabled={passportSent || loading}
                        sx={{mb: 2}}
                    >
                        {loading ? <CircularProgress size={24}/> : t("export.depositExport.sendPassport")}
                    </Button>

                    <FormControl fullWidth disabled={!passportSent} sx={{mb: 2}}>
                        <InputLabel id="account-label">{t("export.depositExport.account")}</InputLabel>
                        <Select
                            labelId="account-label"
                            id="account"
                            value={selectedAccount}
                            onChange={handleAccountChange}
                        >
                            {accounts.map((acc) => (
                                <MenuItem key={acc.id} value={acc.id}>
                                    {acc.depositAccountName} ({t('depositMain.withdrawComponent.balance')}: {acc.balance})
                                    ({t('depositMain.withdrawComponent.currency')}: {acc.moneyType})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{mb: 2}}>
                        <FormLabel>{t('depositMain.withdrawComponent.formatExportTitle')}</FormLabel>
                        <Select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            disabled={!passportSent}
                        >
                            <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
                            <MenuItem value="pdf">PDF</MenuItem>
                            <MenuItem value="csv">CSV</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl component="fieldset" sx={{mb: 2}}>
                        <FormLabel>{t('depositMain.withdrawComponent.operationType')}</FormLabel>
                        {["CREATE", "DEPOSITING", "WITHDRAW", "TRANSFER"].map((type) => (
                            <FormControlLabel
                                key={type}
                                control={
                                    <Checkbox
                                        name={type}
                                        checked={operations[type]}
                                        onChange={handleOperationChange}
                                        disabled={!passportSent}
                                    />
                                }
                                label={
                                    type === "DEPOSITING"
                                        ? t('depositMain.withdrawComponent.type.DEPOSITING')
                                        : type === "WITHDRAW"
                                            ? t('depositMain.withdrawComponent.type.WITHDRAW')
                                            : type === "TRANSFER"
                                                ? t('depositMain.withdrawComponent.type.TRANSFER')
                                                : type === "CREATE"
                                                    ? t('depositMain.withdrawComponent.type.CREATE')
                                                    : type
                                }
                            />
                        ))}
                    </FormControl>


                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={processDownload}
                        disabled={!isReadyToSubmit}
                    >
                        {t('depositMain.withdrawComponent.build')}
                    </Button>
                </Box>
            </Modal>

        </ThemeProvider>
    );
};

export default ExportConfigModal;