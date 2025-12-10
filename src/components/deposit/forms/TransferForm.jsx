import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {GET_DEPOSITS, TRANSFER} from "../../../config.js";
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

const TransferForm = ({onClose, onSubmit}) => {
    const [t] = useTranslation();

    const [amount, setAmount] = useState("");
    const [passport, setPassport] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [fromAccount, setFromAccount] = useState("");
    const [toAccount, setToAccount] = useState("");
    const [passportSent, setPassportSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [transferToOwnAccount, setTransferToOwnAccount] = useState(false);
    const [anotherAccount, setAnotherAccount] = useState("");

    const handlePassportChange = (event) => setPassport(event.target.value);
    const handleAmountChange = (event) => setAmount(event.target.value);
    const handleFromAccountChange = (event) => setFromAccount(event.target.value);
    const handleToAccountChange = (event) => setToAccount(event.target.value);
    const handleAnotherAccountChange = (event) =>
        setAnotherAccount(event.target.value);

    const handleToggleTransferToOwn = (event) =>
        setTransferToOwnAccount(event.target.checked);

    const handleSendPassport = () => {
        if (!passport) {
            onSubmit(t('notifications.pleaseEnterID'), 'warn')
            return;
        }

        setLoading(true);
        // Используем query параметр вместо path variable
        authFetch(`${GET_DEPOSITS}?passport=${encodeURIComponent(passport)}`, {
            method: "GET",
        })
            .then((r) => {
                if (!r.ok) {
                    throw new Error('Failed to fetch accounts');
                }
                return r.json();
            })
            .then((data) => {
                setAccounts(data);
                setPassportSent(true);
                setLoading(false);
            })
            .catch((r) => {
                console.error("Ошибка:", r);
                onSubmit(t('notifications.operationFailed'), 'error')
                setLoading(false);
            });
    };

    const handleTransfer = () => {
        if (!fromAccount) {
            onSubmit(t('notifications.pleaseEnter.withdrawAccount'), 'warn')
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            onSubmit(t('notifications.invalidAmount'), 'warn')
            return;
        }
        if (!toAccount && transferToOwnAccount) {
            onSubmit(t('notifications.pleaseEnter.putAccount'), 'warn')
            return;
        }
        if (!anotherAccount && !transferToOwnAccount) {
            onSubmit(t('notifications.pleaseEnter.enterOtherAccountValue'), 'warn')
            return;
        }

        const payload = {
            fromAccount,
            amount: parseFloat(amount),
            toAccount: transferToOwnAccount ? toAccount : anotherAccount,
        };

        authFetch(TRANSFER, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
        }).then(async (response) => {
            if (response.ok) {
                onSubmit(t('notifications.operationSucceeded'), 'success')
                // Сброс формы
                setFromAccount("");
                setToAccount("");
                setAnotherAccount("");
                setAmount("");
                setPassport("");
                setPassportSent(false);
                setAccounts([]);
                setTransferToOwnAccount(false);
            } else {
                const error = await response.text();
                console.error("Ошибка при переводе:", error);
                onSubmit(t('notifications.operationFailed'), 'error')
            }
        }).catch(error => {
            console.error("Ошибка сети:", error);
            onSubmit(t('notifications.operationFailed'), 'error')
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    maxWidth: 400,
                    margin: "0 auto",
                }}
            >
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('depositMain.transferMoney.transfer')}
                </Typography>

                <TextField
                    id="passport"
                    label={t('depositMain.transferMoney.accountId')}
                    variant="outlined"
                    value={passport}
                    onChange={handlePassportChange}
                    fullWidth
                    disabled={passportSent || loading}
                />

                <Button
                    variant="contained"
                    onClick={handleSendPassport}
                    disabled={passportSent || loading}
                >
                    {loading ? <CircularProgress size={24} /> : t('depositMain.transferMoney.sendPassport')}
                </Button>

                <FormControl fullWidth disabled={!passportSent}>
                    <InputLabel id="from-account-label">
                        {t("depositMain.transferMoney.withdrawAccount")}
                    </InputLabel>
                    <Select
                        labelId="from-account-label"
                        id="from-account"
                        value={fromAccount}
                        onChange={handleFromAccountChange}
                    >
                        {accounts.map((acc) => (
                            <MenuItem key={acc.id} value={acc.id}>
                                {acc.depositAccountName} ({t('depositMain.transferMoney.balance')}: {acc.balance}) ({t('depositMain.transferMoney.currency')}:{" "}
                                {acc.moneyType})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={
                        <Switch
                            checked={transferToOwnAccount}
                            onChange={handleToggleTransferToOwn}
                        />
                    }
                    label={t('depositMain.transferMoney.transferToUrSelf')}
                />

                {transferToOwnAccount ? (
                    <FormControl fullWidth disabled={!passportSent}>
                        <InputLabel id="to-account-label">{t('depositMain.transferMoney.putAccount')}</InputLabel>
                        <Select
                            labelId="to-account-label"
                            id="to-account"
                            value={toAccount}
                            onChange={handleToAccountChange}
                        >
                            {accounts.map((acc) => (
                                <MenuItem key={acc.id} value={acc.id}>
                                    {acc.depositAccountName} ({t('depositMain.transferMoney.balance')}: {acc.balance}) ({t('depositMain.transferMoney.currency')}:{" "}
                                    {acc.moneyType})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <TextField
                        id="anotherAccount"
                        label={t("depositMain.transferMoney.otherAccount")}
                        variant="outlined"
                        value={anotherAccount}
                        disabled={!passportSent || !fromAccount}
                        onChange={handleAnotherAccountChange}
                        fullWidth
                    />
                )}

                <TextField
                    id="amount"
                    label={t("depositMain.transferMoney.transferAmount")}
                    variant="outlined"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    fullWidth
                    inputProps={{ min: 0, step: "0.01" }}
                    disabled={!passportSent || !fromAccount}
                />

                <Button
                    variant="contained"
                    onClick={handleTransfer}
                    disabled={!passportSent || !fromAccount || (!toAccount && !anotherAccount)}
                >
                    {t('depositMain.transferMoney.transferButton')}
                </Button>
            </Box>
        </ThemeProvider>
    );
};

export default TransferForm;