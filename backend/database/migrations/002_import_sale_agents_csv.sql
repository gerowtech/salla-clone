-- Import the 10 rows from s-a.csv. The supplied CSV assigns them to company_id=1.
-- Change the company_id values below if these records belong to a different company.
INSERT INTO public.sale_agents
  (company_id, agent_code, agent_name, email, mobile, commission_type, commission_rate, status)
VALUES
  (1, 'SA-001', 'Ahmed Khan', 'ahmed@example.com', '03001234561', 'percentage', 5.00, 'active'),
  (1, 'SA-002', 'Usman Ali', 'usman@example.com', '03001234562', 'percentage', 7.00, 'active'),
  (1, 'SA-003', 'Bilal Ahmed', 'bilal@example.com', '03001234563', 'percentage', 4.00, 'active'),
  (1, 'SA-004', 'Hassan Raza', 'hassan@example.com', '03001234564', 'fixed', 500.00, 'active'),
  (1, 'SA-005', 'Ayesha Malik', 'ayesha@example.com', '03001234565', 'percentage', 6.00, 'active'),
  (1, 'SA-006', 'Hamza Sheikh', 'hamza@example.com', '03001234566', 'percentage', 8.00, 'active'),
  (1, 'SA-007', 'Faisal Iqbal', 'faisal@example.com', '03001234567', 'fixed', 700.00, 'active'),
  (1, 'SA-008', 'Imran Shah', 'imran@example.com', '03001234568', 'percentage', 5.00, 'active'),
  (1, 'SA-009', 'Naveed Akhtar', 'naveed@example.com', '03001234569', 'percentage', 4.00, 'active'),
  (1, 'SA-010', 'Zain Abbas', 'zain@example.com', '03001234570', 'percentage', 6.00, 'active')
ON CONFLICT (company_id, agent_code) WHERE agent_code IS NOT NULL
DO UPDATE SET
  agent_name = EXCLUDED.agent_name,
  email = EXCLUDED.email,
  mobile = EXCLUDED.mobile,
  commission_type = EXCLUDED.commission_type,
  commission_rate = EXCLUDED.commission_rate,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;
