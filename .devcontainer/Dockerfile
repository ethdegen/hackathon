ARG POSTGRES_VERSION=18

FROM postgres:${POSTGRES_VERSION}-trixie

ARG POSTGRES_VERSION
ARG PYTHON_VERSION=3.14.6
ARG NODEJS_VERSION=24.17.0
ARG GOLANG_VERSION=1.26.4

USER root
WORKDIR /tmp
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt update && apt install -y apt build-essential ca-certificates curl gdb git libncursesw5-dev libssl-dev libsqlite3-dev libgdbm-dev libc6-dev libbz2-dev libffi-dev postgresql-${POSTGRES_VERSION}-pgvector postgresql-server-dev-all procps tk-dev unzip zlib1g-dev

# Install Python
RUN curl -fsSL https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tgz | tar -zx -C ~/
RUN cd ~/Python-${PYTHON_VERSION} && ./configure --with-lto && make -s -j$(nproc) && make install && update-alternatives --install /usr/bin/python python /usr/local/bin/python3 0 && update-alternatives --install /usr/bin/pip pip /usr/local/bin/pip3 0 && update-alternatives --install /usr/bin/pydoc pydoc /usr/local/bin/pydoc3 0 && ln -sf /usr/bin/python /usr/bin/python3 && ln -sf /bin/python /bin/python3
RUN pip install --no-cache-dir --upgrade debugpy pip poetry ruff uv && poetry config virtualenvs.create false

# Install NodeJS
RUN curl -fsSL https://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-linux-$(dpkg --print-architecture | sed 's/amd64/x64/').tar.xz | tar -xJ -C /usr/local --strip-components=1
RUN npm install -g @anthropic-ai/claude-code eslint prettier

# Install GoLang
RUN curl -fsSL https://go.dev/dl/go${GOLANG_VERSION}.linux-$(dpkg --print-architecture).tar.gz | tar -zx -C /usr/local/
RUN echo "export PATH=/usr/local/go/bin:\$PATH" > /etc/profile.d/go.sh
RUN source /etc/profile.d/go.sh && go install github.com/go-delve/delve/cmd/dlv@latest && go install golang.org/x/tools/gopls@latest && go install golang.org/x/tools/cmd/gorename@latest && go install honnef.co/go/tools/cmd/staticcheck@latest

# Install Docker
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
RUN apt update && apt install -y containerd.io docker-buildx-plugin docker-ce docker-ce-cli docker-compose-plugin

# Install Kiro
RUN curl -fsSL https://cli.kiro.dev/install | bash
RUN echo "export PATH=\$HOME/.local/bin:\$PATH" > /etc/profile.d/kiro.sh
RUN source /etc/profile.d/kiro.sh
