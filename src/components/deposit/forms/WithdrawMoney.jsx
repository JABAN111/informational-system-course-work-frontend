import {useState} from 'react';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress'; // Импортируем индикатор загрузки
import {createTheme, ThemeProvider} from '@mui/material/styles';
import authFetch from "../../../hooks/authFetch.jsx";
import {GET_DEPOSITS, WITHDRAW_DEPOSIT} from "../../../config.js";
import {useTranslation} from "react-i18next";
import '../../../i18n.js'

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

const WithdrawForm = ({onClose, onSubmit}) => {
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
        setSelectedAccount(event.target.value);
    };

    const handleAmountChange = (event) => {
        setAmount(event.target.value);
    };

    const handleSendPassport = () => {
        if (!passport) {
            onSubmit(t("notifications.pleaseEnterID"), 'warn')
            return;
        }

        setLoading(true);

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

    const handleWithdraw = () => {
        if (!selectedAccount) {
            onSubmit(t("notifications.pleaseEnterAccount"), 'warn')
            return;
        }
        authFetch(
            WITHDRAW_DEPOSIT, {
                method: 'POST',
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    fromAccount: selectedAccount,
                    amount: amount,
                    toAccount: selectedAccount
                }),

            }).then((response) => {
            if (response.status === 200) {
                onSubmit(t("notifications.operationSucceeded"), 'success')
            } else {
                onSubmit(t("notifications.operationFailed"), 'error')
            }
        })

        setSelectedAccount('');
        setPassport('');
        setPassportSent(false);
        setAccounts([]);
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
                    {t('depositMain.withdrawComponent.withdraw')}
                </Typography>
                <TextField
                    id="passport"
                    label={t('depositMain.withdrawComponent.accountId')}
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
                    {loading ? <CircularProgress size={24}/>
                        : t('depositMain.withdrawComponent.sendID')}
                </Button>
                <FormControl fullWidth disabled={!passportSent}> {/* Блокируем, пока не отправлен паспорт */}
                    <InputLabel id="account-label">{t("depositMain.withdrawComponent.account")}</InputLabel>
                    <Select
                        labelId="account-label"
                        id="account"
                        value={selectedAccount}
                        label={t("depositMain.withdrawComponent.account")}
                        onChange={handleAccountChange}
                    >
                        {accounts.map((acc) => (
                            <MenuItem key={acc.id} value={acc.id}>
                                {acc.depositAccountName} ({t("depositMain.withdrawComponent.balance")}: {acc.balance}) ({t("depositMain.withdrawComponent.currency")}: {acc.moneyType})
                            </MenuItem>
                        ))}
                    </Select>

                </FormControl>
                <TextField
                    id="amount"
                    label={t("depositMain.withdrawComponent.amountOfWithdrawing")}
                    variant="outlined"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    fullWidth
                    inputProps={{min: 0}}
                    disabled={!passportSent || !selectedAccount}
                />
                <Button variant="contained" onClick={handleWithdraw} disabled={!selectedAccount}>
                    {t("depositMain.withdrawComponent.buttonWithdraw")}
                </Button>
            </Box>
        </ThemeProvider>
    );
};

export default WithdrawForm;