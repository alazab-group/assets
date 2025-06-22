from setuptools import setup, find_packages
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "assets"))
from assets import __version__ as version

with open("requirements.txt") as f:
    install_requires = f.read().strip().split("\n")

setup(
    name="assets",
    version=version,
    description="Asset Management App for Alazab ERP",
    author="Alazab Team",
    author_email="info@alazab.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires
)
