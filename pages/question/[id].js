import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Grid from '@mui/material/Grid';
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import styles from "../../styles/Home.module.css";
import Image from "next/image";
import useSWR from "swr";
import Head from "next/head";
import { fetcher } from "../../utils";
import Script from "next/script";
import Container from "../../components/Container";

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest,
    }),
}));

export default function QuestionCard(props) {
    const router = useRouter();
    const { id } = props;
    const [expanded, setExpanded] = useState(true);
    const [logged, setLogged] = useState(false);
    const [answer, setAnswer] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarHint, setSnackbarHint] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [token, setToken] = useState("");

    const { data: question } = useSWR(`/api/question/${id}`, fetcher);

    const { data: originalAnswer } = useSWR(`/api/answer/${id}`, fetcher);

    useEffect(() => {
        if (localStorage.getItem("logged") === "true") {
            setLogged(true);
        }
        if (localStorage.getItem("token")) {
            setToken(localStorage.getItem("token"));
        }
    }, [logged, token]);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleSaveAnswer = async () => {
        await fetcher(`/api/answer?id=${encodeURIComponent(id)}&content=${encodeURIComponent(answer)}`, {
            headers: {
                token,
            },
        });
        setSnackbarHint("提交成功");
        setSnackbarOpen(true);
        router.back();
    };

    const handleDeleteQuestion = async () => {
        await fetcher(`/api/question/delete?id=${encodeURIComponent(id)}`, {
            headers: {
                token,
            },
        });
        setSnackbarHint("删除成功");
        setSnackbarOpen(true);
        router.back();
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container title="问题详情" >
            <h1 className={styles.title}>
                问题详情 <br /> <br />
            </h1>

            {!question ? (
                <CircularProgress />
            ) : (
                <Grid container columns={12} justifyContent="center" alignItems="flex-start">
                    <Card item xs={12} sm={6} md={4} lg={3}>
                        <CardHeader subheader={new Date(question?.createdAt).toLocaleString()} />
                        <CardContent>
                            <Typography variant="h6" color="text.header">
                                {question?.content?.split("\n").map((item, index) => (
                                    <div key={`question_content_${index}`}>
                                        <span>{item}</span>
                                        <br />
                                    </div>
                                ))}
                            </Typography>
                        </CardContent>
                        <CardActions disableSpacing>
                            <IconButton aria-label="back-to-list" onClick={() => router.push("/")}>
                                <ArrowBackIcon />
                            </IconButton>
                            <ExpandMore expand={expanded} onClick={handleExpandClick} aria-expanded={expanded} aria-label="comment">
                                {expanded ? <ExpandLessOutlinedIcon /> : <AddCommentOutlinedIcon />}
                            </ExpandMore>
                        </CardActions>
                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                            {logged ? (
                                <>
                                    <CardContent>
                                        <TextField
                                            fullWidth
                                            onInput={(e) => {
                                                setAnswer(e.target.value);
                                            }}
                                            rows={4}
                                            multiline
                                            autoFocus
                                            margin="dense"
                                            id="answer"
                                            label="回答"
                                            variant="outlined"
                                            defaultValue={originalAnswer?.content}
                                        />
                                    </CardContent>
                                    <CardActions disableSpacing>
                                        {logged && (
                                            <>
                                                <Button size="small" onClick={() => setDeleteDialogOpen(true)}>
                                                    删除问题
                                                </Button>
                                                <Dialog
                                                    open={deleteDialogOpen}
                                                    onClose={() => setDeleteDialogOpen(false)}
                                                    aria-labelledby="alert-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                >
                                                    <DialogTitle id="alert-dialog-title">
                                                        {"确认删除问题吗？"}
                                                    </DialogTitle>
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-description">
                                                            问题删除后就永远不存在了，就像人无法两次踏进同一条河流
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={() => setDeleteDialogOpen(false)} autoFocus>取消</Button>
                                                        <Button onClick={handleDeleteQuestion}>
                                                            删除
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
                                            </>
                                        )}
                                        <Button style={{ marginLeft: "auto" }} size="small" onClick={handleSaveAnswer}>
                                            回答
                                        </Button>
                                    </CardActions>
                                </>
                            ) : (
                                <CardContent>
                                    <Typography variant="body1" color="text.secondary" style={{ fontSize: 19 }}>
                                        {originalAnswer?.content?.split("\n").map((item, index) => (
                                            <div key={`answer_content_${index}`}>
                                                <span>{item}</span>
                                                <br />
                                            </div>
                                        ))}
                                    </Typography>
                                </CardContent>
                            )}
                        </Collapse>
                    </Card>
                </Grid>
            )}

            <Snackbar onClose={handleSnackbarClose} autoHideDuration={2000} anchorOrigin={{ vertical: "top", horizontal: "center" }} open={snackbarOpen}>
                <Alert sx={{ width: "100%" }} severity="success">
                    {snackbarHint}
                </Alert>
            </Snackbar>
        </Container >
    );
}

export async function getServerSideProps({ params }) {
    return {
        props: {
            id: params.id,
        },
    };
}
