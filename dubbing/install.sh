#!/usr/bin/env bash
# ============================================================
# 2020 Missing Semester Korean Dubbing Pipeline - Installer
# ============================================================
# USB-isolated installation. No sudo. No host pollution.
# Usage: source /media/namykim/EXT4/setup_usb_env.sh && bash dubbing/install.sh
# ============================================================

set -euo pipefail

USB_ROOT="/media/namykim/EXT4"
SETUP_SCRIPT="$USB_ROOT/setup_usb_env.sh"
PIP_CACHE="$USB_ROOT/.pip_cache"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# --- Pre-flight checks ---
info "Checking USB environment..."
source "$SETUP_SCRIPT" || error "Failed to source setup_usb_env.sh"

PYTHON="$(which python3 2>/dev/null || which python 2>/dev/null)"
[[ -z "$PYTHON" ]] && error "Python not found in USB environment"
info "Python: $PYTHON ($($PYTHON --version 2>&1))"

FFMPEG="$(which ffmpeg 2>/dev/null)"
[[ -z "$FFMPEG" ]] && error "FFmpeg not found in USB environment"
info "FFmpeg: $FFMPEG"

# --- Check GPU availability ---
GPU_AVAILABLE=false
if command -v nvidia-smi &>/dev/null; then
    if nvidia-smi &>/dev/null; then
        GPU_AVAILABLE=true
        info "NVIDIA GPU detected. Installing CUDA-enabled PyTorch."
    fi
fi

if [[ "$GPU_AVAILABLE" == false ]]; then
    warn "No NVIDIA GPU detected. Installing CPU-only PyTorch."
    warn "WhisperX will run on CPU (slower). YouTube subtitle fallback available."
fi

# --- Step 1: Install PyTorch (MUST be first to prevent pip override) ---
info "Step 1/4: Installing PyTorch..."
if [[ "$GPU_AVAILABLE" == true ]]; then
    pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118 \
        --cache-dir "$PIP_CACHE" --quiet
else
    pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu \
        --cache-dir "$PIP_CACHE" --quiet
fi
info "PyTorch installed successfully."

# --- Step 2: Install WhisperX dependencies (pinned versions) ---
info "Step 2/4: Installing WhisperX dependencies..."
pip install ctranslate2 faster-whisper \
    --cache-dir "$PIP_CACHE" --quiet
info "WhisperX dependencies installed."

# --- Step 3: Install whisperx with --no-deps (prevent PyTorch override) ---
info "Step 3/4: Installing WhisperX (--no-deps)..."
pip install whisperx --no-deps \
    --cache-dir "$PIP_CACHE" --quiet
info "WhisperX installed (no-deps)."

# --- Step 4: Install remaining packages ---
info "Step 4/4: Installing remaining packages..."
pip install yt-dlp edge-tts srt pydub soundfile numpy \
    --cache-dir "$PIP_CACHE" --quiet
info "All remaining packages installed."

# --- Post-install verification ---
info "Verifying installation..."
VERIFY_RESULT=$($PYTHON -c "
import sys
errors = []
try:
    import torch
    print(f'  torch {torch.__version__} (CUDA: {torch.cuda.is_available()})')
except ImportError as e:
    errors.append(f'torch: {e}')
try:
    import whisperx
    print(f'  whisperx OK')
except ImportError as e:
    errors.append(f'whisperx: {e}')
try:
    import edge_tts
    print(f'  edge_tts OK')
except ImportError as e:
    errors.append(f'edge_tts: {e}')
try:
    import yt_dlp
    print(f'  yt_dlp {yt_dlp.version.__version__}')
except ImportError as e:
    errors.append(f'yt_dlp: {e}')
try:
    import srt
    print(f'  srt OK')
except ImportError as e:
    errors.append(f'srt: {e}')
try:
    import pydub
    print(f'  pydub OK')
except ImportError as e:
    errors.append(f'pydub: {e}')
try:
    import soundfile
    print(f'  soundfile OK')
except ImportError as e:
    errors.append(f'soundfile: {e}')

if errors:
    print(f'\nFAILED imports:')
    for e in errors:
        print(f'  - {e}')
    sys.exit(1)
else:
    print(f'\nAll imports successful!')
    sys.exit(0)
" 2>&1)

echo "$VERIFY_RESULT"

if [[ $? -eq 0 ]]; then
    info "Installation complete! All dependencies verified."
    echo ""
    info "Disk usage:"
    du -sh "$USB_ROOT/mamba_root/envs/ai_env/lib/python3.10/site-packages" 2>/dev/null || true
    du -sh "$PIP_CACHE" 2>/dev/null || true
    echo ""
    info "Next step: Run the dubbing pipeline via work_prompt.md"
else
    error "Some imports failed. Check errors above."
fi
