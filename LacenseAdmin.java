import javax.swing.*;
import javax.swing.border.*;
import javax.swing.filechooser.FileNameExtensionFilter;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.*;
import javax.imageio.*;
import java.io.*;
import java.nio.file.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;

/**
 * LacenseAdmin — Interfaccia desktop per gestire la galleria del sito Lacense.
 * Richiede Java 11+.
 *
 * Compilazione:  javac LacenseAdmin.java
 * Avvio:         java LacenseAdmin
 *   (eseguire dalla cartella root del progetto)
 */
public class LacenseAdmin extends JFrame {

    // ── Costanti di percorso ───────────────────────────────────────────────────
    private static final File ROOT       = new File(System.getProperty("user.dir"));
    private static final File POSTS_DIR  = new File(ROOT, "assets/posts");
    private static final File POSTS_JSON = new File(ROOT, "data/posts.json");

    // ── Palette / font (brutalist B&W) ────────────────────────────────────────
    private static final Color C_BLACK  = Color.BLACK;
    private static final Color C_WHITE  = Color.WHITE;
    private static final Color C_GRAY   = new Color(240, 240, 240);
    private static final Color C_DGRAY  = new Color(100, 100, 100);

    private static final Font F_TITLE  = new Font("Courier New", Font.BOLD, 18);
    private static final Font F_LABEL  = new Font("Courier New", Font.BOLD, 10);
    private static final Font F_FIELD  = new Font("Courier New", Font.PLAIN, 13);
    private static final Font F_CARD   = new Font("Courier New", Font.BOLD, 11);
    private static final Font F_META   = new Font("Courier New", Font.PLAIN, 10);
    private static final Font F_STATUS = new Font("Courier New", Font.PLAIN, 11);

    // ── Stato ─────────────────────────────────────────────────────────────────
    private File selectedImageFile = null;
    private List<Map<String, String>> posts = new ArrayList<>();

    // ── Widget principali ─────────────────────────────────────────────────────
    private JLabel     imagePreview;
    private JTextField fTitle, fMaterial, fDetailLabel, fDetailValue, fWeight;
    private JPanel     itemsGrid;
    private JLabel     statusLabel;
    private JButton    btnPublish;

    // ═════════════════════════════════════════════════════════════════════════
    //  Costruttore / setup UI
    // ═════════════════════════════════════════════════════════════════════════

    public LacenseAdmin() {
        super("LACENSE // ADMIN_PANEL");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(1150, 720);
        setMinimumSize(new Dimension(850, 600));
        setBackground(C_WHITE);
        setLayout(new BorderLayout());

        add(buildHeader(),  BorderLayout.NORTH);
        add(buildCenter(),  BorderLayout.CENTER);
        add(buildFooter(),  BorderLayout.SOUTH);

        setLocationRelativeTo(null);
        setVisible(true);

        loadPosts();
    }

    // ── Header ────────────────────────────────────────────────────────────────

    private JPanel buildHeader() {
        JPanel p = new JPanel(new BorderLayout());
        p.setBackground(C_BLACK);
        p.setBorder(new EmptyBorder(16, 28, 16, 28));

        JLabel title = new JLabel("LACENSE // ADMIN_PANEL");
        title.setFont(F_TITLE);
        title.setForeground(C_WHITE);
        p.add(title, BorderLayout.WEST);

        JLabel sub = new JLabel("[ GRILLZ_TECH GALLERY MANAGER ]");
        sub.setFont(F_LABEL);
        sub.setForeground(C_DGRAY);
        p.add(sub, BorderLayout.EAST);

        return p;
    }

    // ── Centro: form sx + griglia dx ─────────────────────────────────────────

    private JSplitPane buildCenter() {
        JSplitPane split = new JSplitPane(
            JSplitPane.HORIZONTAL_SPLIT,
            buildFormPanel(),
            buildItemsPanel()
        );
        split.setDividerLocation(340);
        split.setDividerSize(2);
        split.setBorder(null);
        return split;
    }

    // ── Pannello form (sinistra) ───────────────────────────────────────────────

    private JPanel buildFormPanel() {
        JPanel root = new JPanel(new BorderLayout());
        root.setBackground(C_WHITE);
        root.setBorder(new MatteBorder(0, 0, 0, 2, C_BLACK));

        root.add(sectionTitle("// CARICA_NUOVO_ITEM"), BorderLayout.NORTH);

        JPanel form = new JPanel();
        form.setLayout(new BoxLayout(form, BoxLayout.Y_AXIS));
        form.setBackground(C_WHITE);
        form.setBorder(new EmptyBorder(18, 18, 18, 18));

        // Anteprima immagine / drop area
        imagePreview = new JLabel("[ CLICCA PER SELEZIONARE FOTO ]", SwingConstants.CENTER);
        imagePreview.setFont(F_LABEL);
        imagePreview.setForeground(C_DGRAY);
        imagePreview.setPreferredSize(new Dimension(300, 175));
        imagePreview.setMaximumSize(new Dimension(Integer.MAX_VALUE, 175));
        imagePreview.setBackground(C_GRAY);
        imagePreview.setOpaque(true);
        imagePreview.setBorder(BorderFactory.createDashedBorder(C_BLACK, 4, 4, 1, false));
        imagePreview.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        imagePreview.addMouseListener(new MouseAdapter() {
            public void mouseClicked(MouseEvent e) { pickImage(); }
        });
        form.add(imagePreview);
        form.add(vspace(16));

        fTitle       = addField(form, "TITLE",         "VVS_TITAN_GOLD");
        fMaterial    = addField(form, "MATERIAL",      "18K_SOLID_GOLD");
        fDetailLabel = addField(form, "DETAIL LABEL",  "CLARITY");
        fDetailValue = addField(form, "DETAIL VALUE",  "VVS_DIAMONDS");
        fWeight      = addField(form, "WEIGHT",        "42.5G");
        form.add(vspace(6));

        JButton btnAdd = blackButton("[ ADD_ITEM >> ]");
        btnAdd.setMaximumSize(new Dimension(Integer.MAX_VALUE, 40));
        btnAdd.addActionListener(e -> addItem());
        form.add(btnAdd);

        JScrollPane scroll = new JScrollPane(form);
        scroll.setBorder(null);
        root.add(scroll, BorderLayout.CENTER);
        return root;
    }

    // ── Pannello griglia item (destra) ────────────────────────────────────────

    private JPanel buildItemsPanel() {
        JPanel root = new JPanel(new BorderLayout());
        root.setBackground(C_WHITE);

        root.add(sectionTitle("// GALLERY_ITEMS"), BorderLayout.NORTH);

        itemsGrid = new JPanel(new WrapLayout(FlowLayout.LEFT, 10, 10));
        itemsGrid.setBackground(C_WHITE);

        JScrollPane scroll = new JScrollPane(itemsGrid);
        scroll.setBorder(null);
        scroll.getVerticalScrollBar().setUnitIncrement(16);
        root.add(scroll, BorderLayout.CENTER);
        return root;
    }

    // ── Footer publish bar ────────────────────────────────────────────────────

    private JPanel buildFooter() {
        JPanel p = new JPanel(new BorderLayout(0, 10));
        p.setBackground(C_WHITE);
        p.setBorder(new CompoundBorder(
            new MatteBorder(4, 0, 0, 0, C_BLACK),
            new EmptyBorder(16, 28, 16, 28)
        ));

        btnPublish = blackButton("[ PUBBLICA_SU_GITHUB ]");
        btnPublish.setFont(new Font("Courier New", Font.BOLD, 15));
        btnPublish.setPreferredSize(new Dimension(0, 48));
        btnPublish.addActionListener(e -> publish());
        p.add(btnPublish, BorderLayout.CENTER);

        statusLabel = new JLabel("> in attesa...");
        statusLabel.setFont(F_STATUS);
        statusLabel.setForeground(C_DGRAY);
        p.add(statusLabel, BorderLayout.SOUTH);

        return p;
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Azioni
    // ═════════════════════════════════════════════════════════════════════════

    private void pickImage() {
        JFileChooser fc = new JFileChooser();
        fc.setFileFilter(new FileNameExtensionFilter("Immagini", "jpg", "jpeg", "png", "webp", "gif"));
        if (fc.showOpenDialog(this) != JFileChooser.APPROVE_OPTION) return;

        selectedImageFile = fc.getSelectedFile();
        try {
            BufferedImage raw = ImageIO.read(selectedImageFile);
            if (raw != null) {
                Image scaled = raw.getScaledInstance(300, 175, Image.SCALE_SMOOTH);
                imagePreview.setIcon(new ImageIcon(scaled));
                imagePreview.setText("");
            }
        } catch (IOException ex) {
            setStatus("[ERR] Impossibile leggere l'immagine");
        }
    }

    private void addItem() {
        if (selectedImageFile == null) { setStatus("[ERR] Seleziona un'immagine"); return; }

        String title       = fieldVal(fTitle,       "VVS_TITAN_GOLD");
        String material    = fieldVal(fMaterial,    "18K_SOLID_GOLD");
        String detailLabel = fieldVal(fDetailLabel, "CLARITY");
        String detailValue = fieldVal(fDetailValue, "VVS_DIAMONDS");
        String weight      = fieldVal(fWeight,      "42.5G");

        if (title.isEmpty() || material.isEmpty() || detailLabel.isEmpty()
                || detailValue.isEmpty() || weight.isEmpty()) {
            setStatus("[ERR] Tutti i campi sono obbligatori");
            return;
        }

        // Copia immagine in assets/posts/
        String filename = System.currentTimeMillis() + "-"
            + selectedImageFile.getName().replaceAll("[^a-zA-Z0-9._-]", "_").toLowerCase();
        try {
            Files.copy(selectedImageFile.toPath(),
                       new File(POSTS_DIR, filename).toPath(),
                       StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            setStatus("[ERR] Copia file fallita: " + ex.getMessage());
            return;
        }

        Map<String, String> item = new LinkedHashMap<>();
        item.put("id",          UUID.randomUUID().toString());
        item.put("filename",    filename);
        item.put("title",       title.toUpperCase().replace(' ', '_'));
        item.put("material",    material.toUpperCase().replace(' ', '_'));
        item.put("detailLabel", detailLabel.toUpperCase().replace(' ', '_'));
        item.put("detailValue", detailValue.toUpperCase().replace(' ', '_'));
        item.put("weight",      weight.toUpperCase());
        item.put("createdAt",   new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").format(new Date()));

        posts.add(item);
        savePosts();
        renderItems();
        resetForm();
        setStatus("[OK] Item aggiunto: " + item.get("title") + " — push in corso...");
        publish();
    }

    private void deleteItem(Map<String, String> item) {
        int choice = JOptionPane.showConfirmDialog(this,
            "Eliminare \"" + item.get("title") + "\"?",
            "Conferma eliminazione", JOptionPane.YES_NO_OPTION);
        if (choice != JOptionPane.YES_OPTION) return;

        File img = new File(POSTS_DIR, item.get("filename"));
        if (img.exists()) img.delete();

        posts.removeIf(p -> item.get("id").equals(p.get("id")));
        savePosts();
        renderItems();
        setStatus("[OK] Eliminato: " + item.get("title"));
    }

    private void publish() {
        btnPublish.setEnabled(false);
        btnPublish.setText("[ PUSH_IN_CORSO... ]");
        setStatus("Pubblicazione su GitHub...");

        new Thread(() -> {
            try {
                runGit("add", "data/posts.json", "assets/posts/");
                String date = new SimpleDateFormat("dd/MM/yyyy").format(new Date());
                runGit("commit", "-m", "admin: aggiorna galleria " + date);
                runGit("push", "origin", "main");
                SwingUtilities.invokeLater(() -> setStatus("[OK] Pubblicato su GitHub!"));
            } catch (Exception ex) {
                String msg = ex.getMessage();
                SwingUtilities.invokeLater(() -> setStatus("[ERR] " + (msg != null ? msg : "Errore sconosciuto")));
            } finally {
                SwingUtilities.invokeLater(() -> {
                    btnPublish.setEnabled(true);
                    btnPublish.setText("[ PUBBLICA_SU_GITHUB ]");
                });
            }
        }).start();
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Dati: lettura / scrittura JSON
    // ═════════════════════════════════════════════════════════════════════════

    private void loadPosts() {
        try {
            String json = Files.readString(POSTS_JSON.toPath());
            posts = parseJsonArray(json);
        } catch (IOException e) {
            posts = new ArrayList<>();
        }
        renderItems();
        setStatus("Pronti. " + posts.size() + " item in galleria.");
    }

    private void savePosts() {
        StringBuilder sb = new StringBuilder("[\n");
        for (int i = 0; i < posts.size(); i++) {
            sb.append("  {");
            Map<String, String> item = posts.get(i);
            int j = 0;
            for (Map.Entry<String, String> e : item.entrySet()) {
                sb.append("\"").append(e.getKey()).append("\":\"")
                  .append(e.getValue().replace("\"", "\\\"")).append("\"");
                if (++j < item.size()) sb.append(",");
            }
            sb.append("}");
            if (i < posts.size() - 1) sb.append(",");
            sb.append("\n");
        }
        sb.append("]\n");
        try {
            Files.writeString(POSTS_JSON.toPath(), sb.toString());
        } catch (IOException e) {
            setStatus("[ERR] Salvataggio JSON fallito: " + e.getMessage());
        }
    }

    /** Parser JSON minimalista per il nostro schema specifico. */
    private List<Map<String, String>> parseJsonArray(String json) {
        List<Map<String, String>> result = new ArrayList<>();
        String[] objects = json.split("\\},\\s*\\{");
        for (String obj : objects) {
            obj = obj.replaceAll("[\\[\\]{}]", "").trim();
            if (obj.isEmpty()) continue;
            Map<String, String> map = new LinkedHashMap<>();
            int idx = 0;
            while (idx < obj.length()) {
                int ks = obj.indexOf('"', idx);       if (ks < 0) break;
                int ke = obj.indexOf('"', ks + 1);    if (ke < 0) break;
                int vs = obj.indexOf('"', ke + 2);    if (vs < 0) break;
                // Leggi valore gestendo eventuali escape
                StringBuilder val = new StringBuilder();
                int vi = vs + 1;
                while (vi < obj.length()) {
                    char c = obj.charAt(vi);
                    if (c == '\\' && vi + 1 < obj.length()) { val.append(obj.charAt(vi + 1)); vi += 2; }
                    else if (c == '"') { vi++; break; }
                    else { val.append(c); vi++; }
                }
                map.put(obj.substring(ks + 1, ke), val.toString());
                idx = vi;
            }
            if (!map.isEmpty()) result.add(map);
        }
        return result;
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Render griglia item
    // ═════════════════════════════════════════════════════════════════════════

    private void renderItems() {
        itemsGrid.removeAll();
        if (posts.isEmpty()) {
            JLabel empty = new JLabel("[GALLERY_VUOTA — CARICA IL PRIMO ITEM]");
            empty.setFont(F_LABEL);
            empty.setForeground(C_DGRAY);
            empty.setBorder(new EmptyBorder(30, 20, 0, 0));
            itemsGrid.add(empty);
        } else {
            for (Map<String, String> item : posts) {
                itemsGrid.add(buildCard(item));
            }
        }
        itemsGrid.revalidate();
        itemsGrid.repaint();
    }

    private JPanel buildCard(Map<String, String> item) {
        JPanel card = new JPanel(new BorderLayout());
        card.setBackground(C_WHITE);
        card.setBorder(BorderFactory.createLineBorder(C_BLACK, 2));
        card.setPreferredSize(new Dimension(190, 280));

        // Immagine (in scala di grigi)
        JLabel img = new JLabel("", SwingConstants.CENTER);
        img.setPreferredSize(new Dimension(190, 140));
        img.setOpaque(true);
        img.setBackground(C_GRAY);
        img.setBorder(new MatteBorder(0, 0, 2, 0, C_BLACK));
        File imgFile = new File(POSTS_DIR, item.get("filename"));
        if (imgFile.exists()) {
            try {
                BufferedImage raw = ImageIO.read(imgFile);
                if (raw != null) {
                    BufferedImage gray = toGrayscale(raw);
                    img.setIcon(new ImageIcon(gray.getScaledInstance(190, 140, Image.SCALE_SMOOTH)));
                }
            } catch (IOException ignored) {}
        }
        card.add(img, BorderLayout.NORTH);

        // Testo info
        JPanel info = new JPanel();
        info.setLayout(new BoxLayout(info, BoxLayout.Y_AXIS));
        info.setBackground(C_WHITE);
        info.setBorder(new EmptyBorder(8, 10, 6, 10));

        JLabel lTitle = new JLabel(item.get("title"));
        lTitle.setFont(F_CARD);
        lTitle.setForeground(C_BLACK);
        info.add(lTitle);
        info.add(vspace(4));

        String metaText = "<html><span style='font-family:Courier New;font-size:9px;color:#555'>"
            + "MAT: " + item.get("material") + "<br>"
            + item.get("detailLabel") + ": " + item.get("detailValue") + "<br>"
            + "WT: " + item.get("weight")
            + "</span></html>";
        JLabel lMeta = new JLabel(metaText);
        lMeta.setFont(F_META);
        info.add(lMeta);
        card.add(info, BorderLayout.CENTER);

        // Bottone delete
        JButton del = ghostButton("[DELETE]");
        del.setFont(F_LABEL);
        del.setBorder(new CompoundBorder(
            new MatteBorder(2, 0, 0, 0, C_BLACK),
            new EmptyBorder(6, 10, 6, 10)
        ));
        del.addActionListener(e -> deleteItem(item));
        card.add(del, BorderLayout.SOUTH);

        return card;
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Git
    // ═════════════════════════════════════════════════════════════════════════

    private void runGit(String... args) throws IOException, InterruptedException {
        List<String> cmd = new ArrayList<>();
        cmd.add("git");
        cmd.addAll(Arrays.asList(args));

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.directory(ROOT);
        pb.redirectErrorStream(true);

        Process proc = pb.start();
        String out = new String(proc.getInputStream().readAllBytes()).trim();
        int exit = proc.waitFor();

        if (exit != 0) {
            if (out.contains("nothing to commit") || out.contains("nothing added to commit") || out.contains("no changes added to commit")) return;
            throw new IOException(out.isEmpty() ? "git exit " + exit : out);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Helper UI
    // ═════════════════════════════════════════════════════════════════════════

    private JLabel sectionTitle(String text) {
        JLabel l = new JLabel(text);
        l.setFont(F_LABEL);
        l.setBorder(new CompoundBorder(
            new MatteBorder(0, 0, 2, 0, C_BLACK),
            new EmptyBorder(12, 18, 12, 18)
        ));
        return l;
    }

    private JTextField addField(JPanel parent, String label, String placeholder) {
        JLabel lbl = new JLabel(label);
        lbl.setFont(F_LABEL);
        lbl.setAlignmentX(LEFT_ALIGNMENT);
        parent.add(lbl);
        parent.add(vspace(3));

        JTextField field = new JTextField();
        field.setFont(F_FIELD);
        field.setBorder(BorderFactory.createLineBorder(C_BLACK, 2));
        field.setMaximumSize(new Dimension(Integer.MAX_VALUE, 34));
        field.setAlignmentX(LEFT_ALIGNMENT);
        // Placeholder
        field.setForeground(Color.GRAY);
        field.setText(placeholder);
        field.addFocusListener(new FocusAdapter() {
            public void focusGained(FocusEvent e) {
                if (field.getText().equals(placeholder)) { field.setText(""); field.setForeground(C_BLACK); }
            }
            public void focusLost(FocusEvent e) {
                if (field.getText().isEmpty()) { field.setText(placeholder); field.setForeground(Color.GRAY); }
            }
        });
        parent.add(field);
        parent.add(vspace(10));
        return field;
    }

    private String fieldVal(JTextField f, String placeholder) {
        String v = f.getText().trim();
        return v.equals(placeholder) ? "" : v;
    }

    private void resetForm() {
        selectedImageFile = null;
        imagePreview.setIcon(null);
        imagePreview.setText("[ CLICCA PER SELEZIONARE FOTO ]");
        resetPlaceholder(fTitle,       "VVS_TITAN_GOLD");
        resetPlaceholder(fMaterial,    "18K_SOLID_GOLD");
        resetPlaceholder(fDetailLabel, "CLARITY");
        resetPlaceholder(fDetailValue, "VVS_DIAMONDS");
        resetPlaceholder(fWeight,      "42.5G");
    }

    private void resetPlaceholder(JTextField f, String placeholder) {
        f.setText(placeholder);
        f.setForeground(Color.GRAY);
    }

    private JButton blackButton(String text) {
        JButton b = new JButton(text);
        b.setFont(new Font("Courier New", Font.BOLD, 12));
        b.setBackground(C_BLACK);
        b.setForeground(C_WHITE);
        b.setBorder(BorderFactory.createLineBorder(C_BLACK, 2));
        b.setFocusPainted(false);
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        return b;
    }

    private JButton ghostButton(String text) {
        JButton b = new JButton(text);
        b.setFont(new Font("Courier New", Font.BOLD, 12));
        b.setBackground(C_WHITE);
        b.setForeground(C_BLACK);
        b.setBorder(BorderFactory.createLineBorder(C_BLACK, 2));
        b.setFocusPainted(false);
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        return b;
    }

    private Component vspace(int h) {
        return Box.createRigidArea(new Dimension(0, h));
    }

    private BufferedImage toGrayscale(BufferedImage src) {
        BufferedImage gray = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = gray.createGraphics();
        g.drawImage(src, 0, 0, null);
        g.dispose();
        return gray;
    }

    private void setStatus(String msg) {
        SwingUtilities.invokeLater(() -> { if (statusLabel != null) statusLabel.setText("> " + msg); });
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  WrapLayout — layout a griglia che va a capo automaticamente
    // ═════════════════════════════════════════════════════════════════════════

    static class WrapLayout extends FlowLayout {
        WrapLayout(int align, int hgap, int vgap) { super(align, hgap, vgap); }

        public Dimension preferredLayoutSize(Container target) {
            return layoutSize(target, true);
        }
        public Dimension minimumLayoutSize(Container target) {
            return layoutSize(target, false);
        }

        private Dimension layoutSize(Container target, boolean preferred) {
            synchronized (target.getTreeLock()) {
                int targetWidth = target.getSize().width;
                if (targetWidth == 0) targetWidth = Integer.MAX_VALUE;

                int hgap = getHgap(), vgap = getVgap();
                Insets insets = target.getInsets();
                int maxWidth = targetWidth - insets.left - insets.right - hgap * 2;

                int x = 0, y = insets.top + vgap, rowH = 0;
                for (int i = 0; i < target.getComponentCount(); i++) {
                    Component c = target.getComponent(i);
                    if (!c.isVisible()) continue;
                    Dimension d = preferred ? c.getPreferredSize() : c.getMinimumSize();
                    if (x != 0 && x + d.width > maxWidth) { y += rowH + vgap; x = 0; rowH = 0; }
                    x += d.width + hgap;
                    rowH = Math.max(rowH, d.height);
                }
                y += rowH + vgap + insets.bottom;
                return new Dimension(targetWidth, y);
            }
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Main
    // ═════════════════════════════════════════════════════════════════════════

    public static void main(String[] args) throws Exception {
        UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName());
        SwingUtilities.invokeLater(LacenseAdmin::new);
    }
}
