# Architecture

## Overview

Frontend application built with:

- React
- TypeScript
- Zustand
- Tailwind CSS

Architecture goal

- maintainable
- scalable
- feature based structure

---

## State Management

Global State

- Zustand

Server State

- React Query (if needed)

Local State

- React useState / useReducer

---

## Data Flow

UI → Hooks → Store/API → UI

1. UI triggers action
2. Custom hook handles logic
3. Zustand or API processes data
4. UI updates

---

## Design Principles

- Feature based architecture
- Separation of concerns
- Reusable hooks
- Stateless UI components when possible