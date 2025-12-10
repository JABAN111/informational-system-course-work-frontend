import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {ADD_TO_DEPOSIT, GET_DEPOSITS} from "../../../config.js";
import {useState} from "react";
import authFetch from "../../../hooks/authFetch.jsx";
import '../../../i18n.js'
import {useTranslation} from "react-i18next";

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#64b5f6',
        },
        background: {
            default: '#212121',
            paper: '#424242',
        },
    },
});

const AddMoney = ({onClose, onSubmit}) => {
    const [t] = useTranslation();

    const [amount, setAmount] = useState(''); // Состояние для суммы
    const [passport, setPassport] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [passportSent, setPassportSent] = useState(false);
    const [loading, setLoading] = useState(false); // Состояние загрузки

    const handlePassportChange = (event) => {
        setPassport(event.target.value);
    };

    const handleAccountChange = (event) => {
        console.log('выбран с ивента: ', event.target.value)
        setSelectedAccount(event.target.value);
    };

    const handleAmountChange = (event) => {
        setAmount(event.target.value);
    };

    const handleSendPassport = () => {
        if (!passport) {
            onSubmit(t('notifications.pleaseEnterID'), 'warn')
            return;
        }

        setLoading(true);

        console.log('отправляем паспорт', passport)
        // Используем query параметр вместо path variable
        authFetch(
            `${GET_DEPOSITS}?passport=${encodeURIComponent(passport)}`,
            {
                method: 'GET',
            }
        ).then(r => {
            if (!r.ok) {
                throw new Error('Failed to fetch accounts');
            }
            return r.json();
        }).then(
            data => {
                console.log(data)
                setAccounts(data)
                setPassportSent(true)
                setLoading(false)
            }
        ).catch(r => {
            console.error("Невалидный паспорт, ошибка:", r)
            onSubmit(t("notifications.operationFailed"), 'error')
            setLoading(false)
        })

    };

    const handleAddMoney = () => {
        if (!selectedAccount) {
            onSubmit(t("notifications.pleaseEnterAccount"), 'warn')
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            onSubmit(t("notifications.invalidAmount"), 'warn')
            return;
        }

        authFetch(
            ADD_TO_DEPOSIT, {
                method: 'POST',
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    fromAccount: selectedAccount,
                    amount: parseFloat(amount),
                    toAccount: selectedAccount
                }),

            }).then(async (response) => {
            if (response.ok) {
                onSubmit(t('notifications.operationSucceeded'), 'success')
                // Сброс формы
                setSelectedAccount('');
                setPassport('');
                setAmount('');
                setPassportSent(false);
                setAccounts([]);
            } else {
                const error = await response.text();
                console.error("Ошибка при пополнении:", error);
                onSubmit(t('notifications.operationFailed'), 'error')
            }
        }).catch(error => {
            console.error("Ошибка сети:", error);
            onSubmit(t('notifications.operationFailed'), 'error')
        })
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    maxWidth: 400,
                    margin: '0 auto',
                }}
            >
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('depositMain.addMoney.put')}
                </Typography>
                <TextField
                    id="passport"
                    label={t("depositMain.addMoney.accountId")}
                    variant="outlined"
                    value={passport}
                    onChange={handlePassportChange}
                    fullWidth
                    disabled={passportSent || loading} // Блокируем поле после отправки или во время загрузки
                />
                <Button
                    variant="contained"
                    onClick={handleSendPassport}
                    disabled={passportSent || loading}>
                    {loading ? <CircularProgress size={24}/> : t("depositMain.addMoney.sendPassport")}
                </Button>
                <FormControl fullWidth disabled={!passportSent}> {/* Блокируем, пока не отправлен паспорт */}
                    <InputLabel id="account-label">
                        {t('depositMain.addMoney.account')}
                    </InputLabel>
                    <Select
                        labelId="account-label"
                        id="account"
                        value={selectedAccount}
                        label={t("depositMain.addMoney.account")}
                        onChange={handleAccountChange}
                    >
                        {accounts.map((acc) => (
                            <MenuItem key={acc.id} value={acc.id}>
                                {acc.depositAccountName} ({t('depositMain.withdrawComponent.balance')}: {acc.balance}) ({t('depositMain.withdrawComponent.currency')}: {acc.moneyType})
                            </MenuItem>
                        ))}
                    </Select>

                </FormControl>
                <TextField
                    id="amount"
                    label={t("depositMain.addMoney.putAmount")}
                    variant="outlined"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    fullWidth
                    inputProps={{min: 0, step: "0.01"}}
                    disabled={!passportSent || !selectedAccount}
                />
                <Button variant="contained" onClick={handleAddMoney} disabled={!selectedAccount}>
                    {t('depositMain.addMoney.buttonPut')}
                </Button>
            </Box>
        </ThemeProvider>
    )

}

export default AddMoney;