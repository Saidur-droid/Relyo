from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Mapping


class RelyoError(RuntimeError):
    pass


class RelyoClient:
    def __init__(self, *, base_url: str, api_key: str, timeout: float = 30.0) -> None:
        base = base_url.rstrip("/")
        if not base.startswith(("https://", "http://")):
            raise ValueError("base_url must be absolute HTTP(S)")
        if not api_key.startswith("rly_live_"):
            raise ValueError("A Relyo API key is required")
        self._base_url = base
        self._api_key = api_key
        self._timeout = timeout

    def _request(self, path: str, *, method: str = "GET", body: Mapping[str, Any] | None = None) -> dict[str, Any]:
        payload = None if body is None else json.dumps(body, separators=(",", ":")).encode("utf-8")
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self._api_key}",
        }
        if payload is not None:
            headers["Content-Type"] = "application/json"
        request = urllib.request.Request(
            f"{self._base_url}{path}",
            data=payload,
            headers=headers,
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=self._timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            message = f"Relyo API request failed with HTTP {exc.code}."
            try:
                data = json.loads(exc.read().decode("utf-8"))
                if isinstance(data.get("error"), str):
                    message = data["error"]
            except Exception:
                pass
            raise RelyoError(message) from exc

    def create_proof_run(
        self,
        *,
        url: str | None = None,
        github_repo: str | None = None,
        webhook_url: str | None = None,
        webhook_secret: str | None = None,
    ) -> dict[str, Any]:
        if not (url and url.strip()) and not (github_repo and github_repo.strip()):
            raise ValueError("Provide url, github_repo, or both")
        body: dict[str, Any] = {}
        if url:
            body["url"] = url
        if github_repo:
            body["githubRepo"] = github_repo
        if webhook_url or webhook_secret:
            if not webhook_url or not webhook_secret:
                raise ValueError("webhook_url and webhook_secret must be supplied together")
            body["webhook"] = {"url": webhook_url, "secret": webhook_secret}
        return self._request("/api/v1/proof-runs", method="POST", body=body)

    def get_proof_run(self, run_id: str) -> dict[str, Any]:
        if not run_id.startswith("run_"):
            raise ValueError("Invalid proof run ID")
        return self._request(f"/api/v1/proof-runs/{urllib.parse.quote(run_id, safe='')}")
