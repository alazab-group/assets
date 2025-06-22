from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in assets/__init__.py
from assets import __version__ as version

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
