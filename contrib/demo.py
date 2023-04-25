import httpx
from jsonrpcclient import request, parse
import nh3


class Readability:
    def __init__(self, server: str) -> None:
        self.client = httpx.Client()
        self.server = server

    def readability(self, body: str):
        resp = self.client.post(f'{self.server}/json-rpc',
                                json=request("readability",
                                             params=dict(body=body)))
        assert resp.status_code == 200
        r = parse(resp.json())
        r.result['content'] = nh3.clean(r.result.get('content'))
        return r.result


if __name__ == '__main__':
    from pprint import pprint
    
    r = Readability('http://localhost:8000')
    resp = httpx.get('https://linuxfr.org/news/ssl-rachete-harrison-consoles-bonne-nouvelle-pour-ardour')
    assert resp.status_code == 200
    rr = r.readability(resp.text)
    pprint(rr)
    with open('/tmp/readability.html', 'w') as f:
        f.write(rr['content'])

