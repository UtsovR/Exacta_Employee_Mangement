const { data } = await supabase.from("profiles").select("role").single();
console.log(data);