"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const MAX_ACCOUNTS = 2;

export type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
};

export async function signUpUser(input: SignUpInput) {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!fullName || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      error: "Cadastro indisponível: SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor.",
    };
  }

  try {
    const admin = createAdminClient();

    const { count, error: countError } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return { error: "Não foi possível verificar as contas existentes." };
    }
    if ((count ?? 0) >= MAX_ACCOUNTS) {
      return {
        error:
          "As 2 contas deste app já foram criadas. Peça ao administrador para entrar com uma delas.",
      };
    }

    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      if (createError.code === "email_exists") {
        return { error: "Já existe uma conta com esse e-mail." };
      }
      return { error: "Não foi possível criar a conta. Tente novamente." };
    }

    return { error: null };
  } catch {
    return { error: "Erro inesperado ao criar a conta. Tente novamente." };
  }
}
