import json
import unittest
from unittest.mock import patch

from relyo import RelyoClient


class FakeResponse:
    def __init__(self, body):
        self.body = body

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False

    def read(self):
        return json.dumps(self.body).encode()


class ClientTests(unittest.TestCase):
    def test_api_key_stays_in_authorization_header(self):
        client = RelyoClient(base_url="https://relyo.example", api_key="rly_live_abcdefghijklmnopqrstuvwxyz")
        with patch("urllib.request.urlopen", return_value=FakeResponse({"run": {"id": "run_1"}})) as mocked:
            client.create_proof_run(github_repo="owner/repo")
            request = mocked.call_args.args[0]
            self.assertEqual(request.get_header("Authorization"), "Bearer rly_live_abcdefghijklmnopqrstuvwxyz")
            self.assertNotIn(b"rly_live_", request.data)
            self.assertNotIn("rly_live_", request.full_url)

    def test_requires_proof_target(self):
        client = RelyoClient(base_url="https://relyo.example", api_key="rly_live_abcdefghijklmnopqrstuvwxyz")
        with self.assertRaises(ValueError):
            client.create_proof_run()


if __name__ == "__main__":
    unittest.main()
