#!/usr/bin/env python
"""
weather.py — 命令行天气查询工具
用法:
    python weather.py                  # 默认查 Beijing
    python weather.py Shanghai         # 查指定城市
    python weather.py Tokyo -u         # 美式:华氏度
    python weather.py Beijing -j       # 原始 JSON 输出
    python weather.py --help
"""
import argparse
import json
import sys
import urllib.error
import urllib.request

API_URL = "https://wttr.in/{city}?format=j1"
TIMEOUT = 15


def fetch_weather(city: str) -> dict:
    """从 wttr.in 拉天气原始 JSON。"""
    url = API_URL.format(city=city)
    req = urllib.request.Request(url, headers={"User-Agent": "weather-cli/0.1"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8"))


def format_human(data: dict, city: str, use_fahrenheit: bool = False) -> str:
    """把 JSON 渲染成对人友好的多行文本。"""
    cc = data["current_condition"][0]
    area = data["nearest_area"][0]

    temp = cc["temp_F"] if use_fahrenheit else cc["temp_C"]
    feels = cc["FeelsLikeF"] if use_fahrenheit else cc["FeelsLikeC"]
    unit = "°F" if use_fahrenheit else "°C"

    area_name = area["areaName"][0]["value"]
    country = area["country"][0]["value"]
    desc = cc["weatherDesc"][0]["value"]
    humidity = cc["humidity"]
    wind_dir = cc["winddir16Point"]
    wind_kmh = cc["windspeedKmph"]
    observed = cc["observation_time"]

    return (
        f"📍 {area_name}, {country}\n"
        f"🌡  温度: {temp}{unit}    (体感 {feels}{unit})\n"
        f"☁️  天气: {desc}\n"
        f"💧 湿度: {humidity}%    💨 风: {wind_dir} {wind_kmh} km/h\n"
        f"🕒 观测时间: {observed} (UTC)"
    )


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="命令行天气查询(数据源 wttr.in)")
    parser.add_argument("city", nargs="?", default="Beijing", help="城市名,默认 Beijing")
    parser.add_argument("-u", "--fahrenheit", action="store_true", help="用华氏度")
    parser.add_argument("-j", "--json", action="store_true", help="输出原始 JSON")
    args = parser.parse_args(argv)

    try:
        data = fetch_weather(args.city)
    except urllib.error.HTTPError as e:
        print(f"❌ 城市没找到或 API 报错: HTTP {e.code} {e.reason}", file=sys.stderr)
        return 2
    except urllib.error.URLError as e:
        print(f"❌ 网络不通: {e.reason}", file=sys.stderr)
        return 3
    except (TimeoutError, json.JSONDecodeError) as e:
        print(f"❌ 数据异常: {e}", file=sys.stderr)
        return 4

    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        print(format_human(data, args.city, args.fahrenheit))
    return 0


if __name__ == "__main__":
    sys.exit(main())
