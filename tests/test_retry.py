import httplib2
import pytest
from googleapiclient.errors import HttpError

from youtube_daily.retry import backoff_delay, call_with_retry, is_retriable


def http_error(status: int) -> HttpError:
    return HttpError(httplib2.Response({"status": status}), b"{}", uri="https://test")


@pytest.mark.parametrize("status", [429, 500, 502, 503, 504])
def test_transient_statuses_are_retriable(status):
    assert is_retriable(http_error(status))


@pytest.mark.parametrize("status", [400, 401, 403, 404])
def test_client_errors_are_not_retriable(status):
    assert not is_retriable(http_error(status))


def test_network_errors_are_retriable():
    assert is_retriable(ConnectionResetError("bağlantı koptu"))
    assert is_retriable(TimeoutError("zaman aşımı"))


def test_backoff_grows_exponentially():
    assert 2 <= backoff_delay(1) < 3
    assert 4 <= backoff_delay(2) < 5
    assert 8 <= backoff_delay(3) < 9


def test_call_with_retry_returns_on_first_success():
    calls = []

    def func():
        calls.append(1)
        return "tamam"

    assert call_with_retry(func, description="test", sleep=lambda _: None) == "tamam"
    assert len(calls) == 1


def test_call_with_retry_recovers_after_transient_failures():
    attempts = {"n": 0}

    def func():
        attempts["n"] += 1
        if attempts["n"] < 3:
            raise http_error(503)
        return "tamam"

    result = call_with_retry(func, description="test", sleep=lambda _: None)
    assert result == "tamam"
    assert attempts["n"] == 3


def test_call_with_retry_raises_immediately_on_permanent_error():
    attempts = {"n": 0}

    def func():
        attempts["n"] += 1
        raise http_error(404)

    with pytest.raises(HttpError):
        call_with_retry(func, description="test", sleep=lambda _: None)
    assert attempts["n"] == 1


def test_call_with_retry_gives_up_after_max_attempts():
    attempts = {"n": 0}

    def func():
        attempts["n"] += 1
        raise http_error(500)

    with pytest.raises(RuntimeError, match="denemenin tamam"):
        call_with_retry(func, description="test", max_attempts=3, sleep=lambda _: None)
    assert attempts["n"] == 3
