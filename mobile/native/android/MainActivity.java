package fr.leqln.app;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

/* Activité principale : le site Le-QLN dans une vue web Capacitor.
   La page s'arrête aux bords des barres du système (heure, gestes, clavier) au lieu de passer dessous. */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            final int fond = 0xFF0B1A3A;
            getWindow().getDecorView().setBackgroundColor(fond);
            WindowInsetsControllerCompat wic = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
            wic.setAppearanceLightStatusBars(false);
            wic.setAppearanceLightNavigationBars(false);
            final View wv = bridge.getWebView();
            if (wv.getParent() instanceof View) ((View) wv.getParent()).setBackgroundColor(fond);
            findViewById(android.R.id.content).setBackgroundColor(fond);
            ViewCompat.setOnApplyWindowInsetsListener(wv, (v, insets) -> {
                Insets b = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.ime());
                ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) v.getLayoutParams();
                if (lp.leftMargin != b.left || lp.topMargin != b.top || lp.rightMargin != b.right || lp.bottomMargin != b.bottom) {
                    lp.setMargins(b.left, b.top, b.right, b.bottom);
                    v.setLayoutParams(lp);
                }
                return WindowInsetsCompat.CONSUMED;
            });
            ViewCompat.requestApplyInsets(wv);
        } catch (Exception e) { /* ignore */ }
    }
}
